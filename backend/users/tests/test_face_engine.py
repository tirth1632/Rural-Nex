import numpy as np
import cv2
import json
from django.test import TestCase
from users.face_engine import face_engine, COSINE_SIMILARITY_THRESHOLD


class ArcFaceEngineTestCase(TestCase):
    def setUp(self):
        # Create synthetic valid RGB image with face-like brightness
        self.valid_img = np.zeros((480, 640, 3), dtype=np.uint8) + 120
        # Draw a clear face shape (circle for head, eyes, nose) to simulate structure
        cv2.circle(self.valid_img, (320, 240), 100, (200, 180, 160), -1)
        cv2.circle(self.valid_img, (280, 210), 15, (50, 50, 50), -1)
        cv2.circle(self.valid_img, (360, 210), 15, (50, 50, 50), -1)

    def test_l2_norm_similarity(self):
        """Test Cosine Similarity calculation between identical and orthogonal vectors."""
        vec_a = np.random.randn(512).astype(np.float32)
        vec_a /= np.linalg.norm(vec_a)

        # Self-similarity must be exactly ~1.0
        sim_self = face_engine.compute_similarity(vec_a.tolist(), vec_a.tolist())
        self.assertAlmostEqual(sim_self, 1.0, places=4)

        # Orthogonal/different vector similarity should be low
        vec_b = np.random.randn(512).astype(np.float32)
        vec_b /= np.linalg.norm(vec_b)
        sim_diff = face_engine.compute_similarity(vec_a.tolist(), vec_b.tolist())
        self.assertLess(sim_diff, COSINE_SIMILARITY_THRESHOLD)

    def test_quality_validation(self):
        """Test passive anti-spoofing quality filters (blurry, dark, overexposed)."""
        # Blurry image (zero variance)
        blank = np.zeros((480, 640, 3), dtype=np.uint8) + 100
        ok, err = face_engine.validate_quality_and_anti_spoofing(blank)
        self.assertFalse(ok)
        self.assertEqual(err, "BLURRY_IMAGE")

        # Dark image
        dark = np.zeros((480, 640, 3), dtype=np.uint8) + 5
        ok, err = face_engine.validate_quality_and_anti_spoofing(dark)
        self.assertFalse(ok)
        self.assertIn("POOR_LIGHTING", err)
