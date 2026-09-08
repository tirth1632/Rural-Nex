import json
import base64
import logging
import numpy as np
import cv2
import insightface
from insightface.app import FaceAnalysis
from typing import Tuple, List, Optional, Dict, Any

logger = logging.getLogger(__name__)

# Verification Thresholds
COSINE_SIMILARITY_THRESHOLD = 0.42  # ArcFace 512-d L2 normalized threshold
MIN_FACE_SIZE = 80                  # Minimum bounding box width/height in pixels
MIN_LAPLACIAN_VAR = 35.0            # Minimum sharpness score to prevent blurry image attacks
MIN_BRIGHTNESS = 30.0               # Minimum average luminance (0-255)
MAX_BRIGHTNESS = 230.0              # Maximum average luminance (0-255)
MAX_GLARE_RATIO = 0.08              # Maximum ratio of blown-out specular pixels (>250)


class ArcFaceEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ArcFaceEngine, cls).__new__(cls)
            cls._instance._initialize_model()
        return cls._instance

    def _initialize_model(self):
        """Lazy load InsightFace SCRFD + ArcFace model pipeline."""
        try:
            logger.info("Initializing InsightFace ArcFace Engine (buffalo_sc)...")
            self.app = FaceAnalysis(name='buffalo_sc', providers=['CPUExecutionProvider'])
            self.app.prepare(ctx_id=0, det_size=(640, 640))
            self.is_initialized = True
            logger.info("InsightFace ArcFace Engine loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize InsightFace model: {e}", exc_info=True)
            self.is_initialized = False
            self.app = None

    def decode_image(self, raw_input: str) -> Optional[np.ndarray]:
        """Convert base64 string or raw bytes into OpenCV BGR image array."""
        try:
            if not raw_input:
                return None
            
            # Handle Base64 URL format (data:image/jpeg;base64,...)
            if isinstance(raw_input, str):
                if ',' in raw_input:
                    raw_input = raw_input.split(',', 1)[1]
                img_bytes = base64.b64decode(raw_input)
            else:
                img_bytes = raw_input

            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as err:
            logger.warning(f"Failed to decode face image payload: {err}")
            return None

    def validate_quality_and_anti_spoofing(self, img: np.ndarray) -> Tuple[bool, Optional[str]]:
        """
        Perform passive anti-spoofing and quality checks on input image frame.
        Checks: Resolution, Sharpness (Laplacian var), Lighting, Screen Glare.
        """
        if img is None or img.size == 0:
            return False, "INVALID_IMAGE_PAYLOAD"

        h, w, _ = img.shape
        if h < MIN_FACE_SIZE or w < MIN_FACE_SIZE:
            return False, "IMAGE_RESOLUTION_TOO_LOW"

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. Laplacian Variance Blur Detection
        lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if lap_var < MIN_LAPLACIAN_VAR:
            logger.info(f"Quality rejection: image too blurry (Laplacian var={lap_var:.2f} < {MIN_LAPLACIAN_VAR})")
            return False, "BLURRY_IMAGE"

        # 2. Exposure & Luminance Range Validation
        mean_brightness = float(np.mean(gray))
        if mean_brightness < MIN_BRIGHTNESS:
            logger.info(f"Quality rejection: poor lighting dark (mean={mean_brightness:.2f} < {MIN_BRIGHTNESS})")
            return False, "POOR_LIGHTING_DARK"
        if mean_brightness > MAX_BRIGHTNESS:
            logger.info(f"Quality rejection: poor lighting overexposed (mean={mean_brightness:.2f} > {MAX_BRIGHTNESS})")
            return False, "POOR_LIGHTING_BRIGHT"

        # 3. Specular Glare / Screen Display Artifact Check
        glare_pixels = np.sum(gray > 250)
        glare_ratio = glare_pixels / float(gray.size)
        if glare_ratio > MAX_GLARE_RATIO:
            logger.info(f"Quality rejection: screen reflection glare detected (glare_ratio={glare_ratio:.4f} > {MAX_GLARE_RATIO})")
            return False, "SCREEN_REFLECTION_GLARE"

        return True, None

    def extract_embedding(self, raw_input: str) -> Tuple[Optional[List[float]], Optional[str], Dict[str, Any]]:
        """
        Detect face using SCRFD, align face, extract ArcFace 512-d embedding, and L2 normalize.
        Returns: (embedding_list, error_code, metadata_dict)
        """
        meta = {"faces_found": 0, "quality_ok": False}
        if not self.is_initialized or self.app is None:
            return None, "MODEL_NOT_INITIALIZED", meta

        img = self.decode_image(raw_input)
        if img is None:
            return None, "INVALID_IMAGE_PAYLOAD", meta

        # Run quality & anti-spoofing filter
        quality_ok, quality_err = self.validate_quality_and_anti_spoofing(img)
        if not quality_ok:
            return None, quality_err, meta

        meta["quality_ok"] = True

        # Run SCRFD Face Detection & Landmark Alignment
        try:
            faces = self.app.get(img)
        except Exception as e:
            logger.error(f"InsightFace detection error: {e}", exc_info=True)
            return None, "DETECTION_ERROR", meta

        meta["faces_found"] = len(faces)

        if len(faces) == 0:
            return None, "NO_FACE_DETECTED", meta
        
        if len(faces) > 1:
            return None, "MULTIPLE_FACES_DETECTED", meta

        face = faces[0]

        # Verify minimum bounding box dimensions
        bbox = face.bbox.astype(int)  # [x1, y1, x2, y2]
        bw = bbox[2] - bbox[0]
        bh = bbox[3] - bbox[1]
        if bw < MIN_FACE_SIZE or bh < MIN_FACE_SIZE:
            return None, "FACE_TOO_SMALL", meta

        # Extract 512-d ArcFace embedding vector
        embedding = face.embedding
        if embedding is None or len(embedding) == 0:
            return None, "EMBEDDING_EXTRACTION_FAILED", meta

        # Apply L2 Normalization strictly: v_norm = v / ||v||_2
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        embedding_list = [float(x) for x in embedding]
        meta["det_score"] = float(face.det_score)
        meta["embedding_dim"] = len(embedding_list)

        return embedding_list, None, meta

    def compute_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Compute Cosine Similarity between two 512-d L2-normalized vectors.
        For L2 normalized vectors, Cosine Similarity S_C(u, v) = u dot v.
        """
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0

        u = np.array(vec1, dtype=np.float32)
        v = np.array(vec2, dtype=np.float32)

        norm_u = np.linalg.norm(u)
        norm_v = np.linalg.norm(v)

        if norm_u == 0 or norm_v == 0:
            return 0.0

        u = u / norm_u
        v = v / norm_v

        sim = float(np.dot(u, v))
        return max(-1.0, min(1.0, sim))


# Global Singleton Instance
face_engine = ArcFaceEngine()
