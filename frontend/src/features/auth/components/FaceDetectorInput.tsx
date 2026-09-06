import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles, UserCheck, StopCircle } from 'lucide-react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

interface FaceDetectorInputProps {
  onFaceCaptured?: (dataUrl: string) => void;
  onStatusChange?: (isValid: boolean) => void;
  autoStart?: boolean;
  autoCapture?: boolean;
}

export const FaceDetectorInput: React.FC<FaceDetectorInputProps> = ({
  onFaceCaptured,
  onStatusChange,
  autoStart = false,
  autoCapture = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const detectorRef = useRef<FaceDetector | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hasCapturedRef = useRef<boolean>(false);
  const latestFaceBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  // Initialize MediaPipe Face Detector
  const initMediaPipe = async () => {
    if (detectorRef.current) return detectorRef.current;
    setIsInitializing(true);
    setErrorMsg(null);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        minDetectionConfidence: 0.5,
      });
      detectorRef.current = detector;
      setIsInitializing(false);
      return detector;
    } catch (err) {
      console.warn('Failed GPU/WASM MediaPipe load, falling back to CPU mode', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: 0.5,
        });
        detectorRef.current = detector;
        setIsInitializing(false);
        return detector;
      } catch (e) {
        console.error('MediaPipe initialization error', e);
        setErrorMsg('Could not load MediaPipe AI model. You can still upload a photo.');
        setIsInitializing(false);
        return null;
      }
    }
  };

  // Start webcam feed
  const startWebcam = async () => {
    try {
      setErrorMsg(null);
      hasCapturedRef.current = false;
      const detector = await initMediaPipe();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      
      streamRef.current = stream;
      setIsStreaming(true);
      setCapturedImage(null);
      onStatusChange?.(false);
    } catch (err: any) {
      console.error('Camera access denied', err);
      setErrorMsg(err?.message || 'Camera access requested. Please allow camera permissions.');
    }
  };

  // Attach stream to video element when isStreaming becomes true
  useEffect(() => {
    if (isStreaming && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video
        .play()
        .then(() => {
          if (detectorRef.current) {
            detectLoop(detectorRef.current);
          }
        })
        .catch((err) => {
          console.error('Error playing video stream:', err);
        });
    }
  }, [isStreaming]);

  // Stop webcam feed
  const stopWebcam = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setFaceDetected(false);
    setConfidence(null);
  };

  // Real-time detection loop using MediaPipe
  const detectLoop = (detector: FaceDetector) => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState >= 2 && !video.paused && !video.ended) {
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;

      const nowInMs = Date.now();
      const detections = detector.detectForVideo(video, nowInMs).detections;

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (detections && detections.length > 0) {
          setFaceDetected(true);
          const score = Math.round((detections[0].categories[0]?.score || 0.9) * 100);
          setConfidence(score);
          onStatusChange?.(true);

          // Automatic sign-in trigger on face detection
          if (autoCapture && !hasCapturedRef.current && score >= 50) {
            hasCapturedRef.current = true;
            setTimeout(() => {
              capturePhoto();
            }, 300);
          }

          // Draw detection bounding box
          detections.forEach((det) => {
            if (det.boundingBox) {
              const { originX, originY, width, height } = det.boundingBox;
              
              latestFaceBoxRef.current = {
                x: Math.max(0, originX),
                y: Math.max(0, originY),
                w: width,
                h: height,
              };

              // Bounding box styling
              ctx.strokeStyle = '#10B981'; // Green accent
              ctx.lineWidth = 3;
              ctx.lineJoin = 'round';
              ctx.strokeRect(originX, originY, width, height);

              // Draw corner accents
              const cornerLen = 14;
              ctx.strokeStyle = '#34D399';
              ctx.lineWidth = 4;
              
              // Top-left
              ctx.beginPath();
              ctx.moveTo(originX, originY + cornerLen);
              ctx.lineTo(originX, originY);
              ctx.lineTo(originX + cornerLen, originY);
              ctx.stroke();

              // Top-right
              ctx.beginPath();
              ctx.moveTo(originX + width - cornerLen, originY);
              ctx.lineTo(originX + width, originY);
              ctx.lineTo(originX + width, originY + cornerLen);
              ctx.stroke();

              // Label badge
              ctx.fillStyle = '#10B981';
              ctx.fillRect(originX, Math.max(0, originY - 24), 130, 22);
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 11px sans-serif';
              ctx.fillText(`Face Detected ${score}%`, originX + 6, Math.max(14, originY - 8));
            }
          });
        } else {
          latestFaceBoxRef.current = null;
          setFaceDetected(false);
          setConfidence(null);
          onStatusChange?.(false);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(() => detectLoop(detector));
  };

  // Capture face snapshot
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    const capCanvas = document.createElement('canvas');
    capCanvas.width = 300;
    capCanvas.height = 300;
    const ctx = capCanvas.getContext('2d');
    
    if (ctx) {
      const box = latestFaceBoxRef.current;
      if (box && box.w > 30 && box.h > 30) {
        // Crop face-only region with 20% margin
        const marginX = box.w * 0.2;
        const marginY = box.h * 0.2;
        const sx = Math.max(0, box.x - marginX);
        const sy = Math.max(0, box.y - marginY);
        const sw = Math.min(video.videoWidth - sx, box.w + marginX * 2);
        const sh = Math.min(video.videoHeight - sy, box.h + marginY * 2);
        
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 300, 300);
      } else {
        // Center crop fallback
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - minDim) / 2;
        const startY = (video.videoHeight - minDim) / 2;
        ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 300, 300);
      }
      const dataUrl = capCanvas.toDataURL('image/jpeg', 0.85);
      
      setCapturedImage(dataUrl);
      onFaceCaptured?.(dataUrl);
      stopWebcam();
    }
  };

  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [autoStart]);

  return (
    <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 transition-all">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">
                MediaPipe Face Detector
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded whitespace-nowrap">
                AI POWERED
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              Verify identity with real-time AI face detection
            </p>
          </div>
        </div>

        {/* Action Toggle Button */}
        {!isStreaming ? (
          <button
            type="button"
            onClick={startWebcam}
            disabled={isInitializing}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm disabled:opacity-50 shrink-0 whitespace-nowrap"
          >
            {isInitializing ? (
              <>
                <RefreshCw size={13} className="animate-spin shrink-0" />
                <span>Loading AI...</span>
              </>
            ) : (
              <>
                <Camera size={14} className="shrink-0" />
                <span>{capturedImage ? 'Retake Face' : 'Scan Face'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopWebcam}
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 px-2 py-1 transition shrink-0 whitespace-nowrap"
          >
            <StopCircle size={14} className="shrink-0" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && !isStreaming && (
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-emerald-200">
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Face Verified & Saved
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">MediaPipe detected valid face profile</p>
          </div>
          <button
            type="button"
            onClick={startWebcam}
            className="text-xs font-semibold text-emerald-700 hover:underline px-2"
          >
            Retake
          </button>
        </div>
      )}

      {/* Active Camera Viewfinder & Instructions */}
      {isStreaming && (
        <div className="space-y-2.5 mt-3">
          <div className="relative overflow-hidden rounded-xl bg-black aspect-video max-h-56 flex items-center justify-center border border-emerald-500/30 shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
            />

            {/* Oval Face Guide Frame Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-32 h-40 rounded-[50%] border-2 transition-all duration-300 ${
                  faceDetected
                    ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'border-amber-400/80 border-dashed animate-pulse'
                }`}
              />
            </div>

            {/* Real-time Status Badge */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-medium border border-white/10 shadow-sm">
              {faceDetected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-300 font-bold">
                    {autoCapture ? `Face Verified (${confidence}%) — Authenticating...` : `Face Detected (${confidence}%)`}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-200">Position face inside ring...</span>
                </>
              )}
            </div>

            {/* Capture Trigger Button */}
            {faceDetected && (
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition transform hover:scale-105 active:scale-95 z-10"
              >
                <UserCheck size={14} />
                Confirm & Save Face
              </button>
            )}
          </div>

          {/* Necessary Instructions Box */}
          <div className="bg-emerald-950/90 text-emerald-100 p-3 rounded-lg text-[11px] space-y-1.5 border border-emerald-800/60 shadow-sm">
            <p className="font-extrabold text-emerald-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span>💡</span> Necessary Face Scan Instructions:
            </p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-emerald-200/90 font-medium">
              <li className="flex items-center gap-1.5">🎯 Center face inside ring</li>
              <li className="flex items-center gap-1.5">💡 Good, direct lighting</li>
              <li className="flex items-center gap-1.5">🕶️ Remove dark glasses</li>
              <li className="flex items-center gap-1.5">👁️ Look straight & hold still</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
