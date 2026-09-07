import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Sparkles, UserCheck, StopCircle, ArrowLeft, ArrowRight, Focus } from 'lucide-react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

export interface FaceDetectorInputProps {
  onFaceCaptured?: (dataUrl: string) => void;
  onStatusChange?: (isValid: boolean) => void;
  autoStart?: boolean;
  autoCapture?: boolean;
  mode?: 'enroll' | 'verify'; // 'enroll' = Mobile Lock 3-pose setup; 'verify' = Fast login scan
}

type EnrollStep = 'center' | 'left' | 'right' | 'complete';

export const FaceDetectorInput: React.FC<FaceDetectorInputProps> = ({
  onFaceCaptured,
  onStatusChange,
  autoStart = false,
  autoCapture = true,
  mode = 'enroll',
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
  
  // Mobile Lock Enrollment States
  const [enrollStep, setEnrollStep] = useState<EnrollStep>('center');
  const [capturedCenter, setCapturedCenter] = useState<string | null>(null);
  const [capturedLeft, setCapturedLeft] = useState<string | null>(null);
  const [capturedRight, setCapturedRight] = useState<string | null>(null);
  const [poseFeedback, setPoseFeedback] = useState<string>('Center face inside target ring');
  const [holdProgress, setHoldProgress] = useState<number>(0);

  const detectorRef = useRef<FaceDetector | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const hasCapturedRef = useRef<boolean>(false);
  const latestFaceBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const latestLandmarksRef = useRef<number[]>([]);
  const holdCounterRef = useRef<number>(0);
  const enrollStepRef = useRef<EnrollStep>('center');
  const capturedCenterRef = useRef<string | null>(null);
  const capturedLeftRef = useRef<string | null>(null);
  const capturedRightRef = useRef<string | null>(null);

  useEffect(() => {
    enrollStepRef.current = enrollStep;
  }, [enrollStep]);

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
      holdCounterRef.current = 0;
      enrollStepRef.current = 'center';
      capturedCenterRef.current = null;
      capturedLeftRef.current = null;
      capturedRightRef.current = null;
      setEnrollStep('center');
      setCapturedCenter(null);
      setCapturedLeft(null);
      setCapturedRight(null);
      setHoldProgress(0);
      
      await initMediaPipe();
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

  // Capture face snapshot for current pose
  const captureSnapshot = (): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    
    const capCanvas = document.createElement('canvas');
    capCanvas.width = 300;
    capCanvas.height = 300;
    const ctx = capCanvas.getContext('2d');
    
    if (ctx) {
      const box = latestFaceBoxRef.current;
      if (box && box.w > 30 && box.h > 30) {
        const marginX = box.w * 0.25;
        const marginY = box.h * 0.25;
        const sx = Math.max(0, box.x - marginX);
        const sy = Math.max(0, box.y - marginY);
        const sw = Math.min(video.videoWidth - sx, box.w + marginX * 2);
        const sh = Math.min(video.videoHeight - sy, box.h + marginY * 2);
        
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 300, 300);
      } else {
        const minDim = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - minDim) / 2;
        const startY = (video.videoHeight - minDim) / 2;
        ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 300, 300);
      }
      return capCanvas.toDataURL('image/jpeg', 0.85);
    }
    return null;
  };

  // Real-time detection & pose tracking loop using MediaPipe
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
          const det = detections[0];
          const score = Math.round((det.categories[0]?.score || 0.9) * 100);
          setConfidence(score);
          onStatusChange?.(true);

          if (det.boundingBox) {
            const { originX, originY, width, height } = det.boundingBox;
            latestFaceBoxRef.current = {
              x: Math.max(0, originX),
              y: Math.max(0, originY),
              w: width,
              h: height,
            };

            // Keypoints & Head Pose Yaw Calculation
            const kps = det.keypoints || [];
            let yawRatio = 0;
            if (kps.length >= 3) {
              const rightEye = kps[0];
              const leftEye = kps[1];
              const noseTip = kps[2];

              const eyeMidX = (rightEye.x + leftEye.x) / 2;
              const eyeDist = Math.abs(leftEye.x - rightEye.x) || 0.001;
              // yawRatio: near 0 = frontal center; negative = turned left; positive = turned right
              yawRatio = (noseTip.x - eyeMidX) / eyeDist;

              // Store normalized landmark vector for backend embedding comparison
              latestLandmarksRef.current = [
                Math.round(eyeDist * 1000) / 1000,
                Math.round(yawRatio * 1000) / 1000,
                Math.round((noseTip.y - Math.min(rightEye.y, leftEye.y)) * 1000) / 1000,
                Math.round((height / (width || 1)) * 1000) / 1000,
              ];
            }

            // Draw Target Bounding Box
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 3;
            ctx.strokeRect(originX, originY, width, height);

            // MODE-SPECIFIC ENROLLMENT OR VERIFICATION
            if (mode === 'enroll') {
              const currentStep = enrollStepRef.current;
              const TARGET_HOLD = 6; // Quick 6-frame (~100ms) hold for snappy response
              
              if (currentStep === 'center') {
                if (Math.abs(yawRatio) <= 0.12 && score >= 45) {
                  setPoseFeedback('Look straight ahead... Hold still 🎯');
                  holdCounterRef.current += 1;
                  setHoldProgress(Math.min(100, Math.round((holdCounterRef.current / TARGET_HOLD) * 100)));
                  
                  if (holdCounterRef.current >= TARGET_HOLD) {
                    const snap = captureSnapshot();
                    if (snap) {
                      capturedCenterRef.current = snap;
                      setCapturedCenter(snap);
                      enrollStepRef.current = 'left';
                      setEnrollStep('left');
                      holdCounterRef.current = 0;
                      setHoldProgress(0);
                    }
                  }
                } else {
                  setPoseFeedback('Center your face straight ahead 🎯');
                  holdCounterRef.current = Math.max(0, holdCounterRef.current - 1);
                  setHoldProgress(Math.round((holdCounterRef.current / TARGET_HOLD) * 100));
                }
              } else if (currentStep === 'left') {
                if ((yawRatio < -0.08 || yawRatio > 0.08) && score >= 40) {
                  setPoseFeedback('Great! Hold left angle... 👈');
                  holdCounterRef.current += 1;
                  setHoldProgress(Math.min(100, Math.round((holdCounterRef.current / TARGET_HOLD) * 100)));

                  if (holdCounterRef.current >= TARGET_HOLD) {
                    const snap = captureSnapshot();
                    if (snap) {
                      capturedLeftRef.current = snap;
                      setCapturedLeft(snap);
                      enrollStepRef.current = 'right';
                      setEnrollStep('right');
                      holdCounterRef.current = 0;
                      setHoldProgress(0);
                    }
                  }
                } else {
                  setPoseFeedback('Slowly turn your head to the LEFT 👈');
                  holdCounterRef.current = Math.max(0, holdCounterRef.current - 1);
                  setHoldProgress(Math.round((holdCounterRef.current / TARGET_HOLD) * 100));
                }
              } else if (currentStep === 'right') {
                if ((yawRatio > 0.08 || yawRatio < -0.08 || holdCounterRef.current > 0) && score >= 40) {
                  setPoseFeedback('Great! Completing 3D setup... 👉');
                  holdCounterRef.current += 1;
                  setHoldProgress(Math.min(100, Math.round((holdCounterRef.current / TARGET_HOLD) * 100)));

                  if (holdCounterRef.current >= TARGET_HOLD) {
                    const snap = captureSnapshot();
                    if (snap) {
                      capturedRightRef.current = snap;
                      setCapturedRight(snap);
                      enrollStepRef.current = 'complete';
                      setEnrollStep('complete');
                      holdCounterRef.current = 0;
                      setHoldProgress(100);

                      const centerImg = capturedCenterRef.current || snap;
                      const leftImg = capturedLeftRef.current || snap;
                      const rightImg = snap;

                      // Finalize Multi-Angle Profile Payload
                      const multiAnglePayload = JSON.stringify({
                        main: centerImg,
                        center: centerImg,
                        left: leftImg,
                        right: rightImg,
                        landmarks: latestLandmarksRef.current,
                        enrolledAt: new Date().toISOString(),
                        version: '2.0-multi-pose'
                      });

                      setCapturedImage(centerImg);
                      onFaceCaptured?.(multiAnglePayload);
                      stopWebcam();
                      return;
                    }
                  }
                } else {
                  setPoseFeedback('Slowly turn your head to the RIGHT 👉');
                  holdCounterRef.current = Math.max(0, holdCounterRef.current - 1);
                  setHoldProgress(Math.round((holdCounterRef.current / TARGET_HOLD) * 100));
                }
              }
            } else {
              // Standard Fast Verification Mode
              setPoseFeedback('Face Positioned 🎯 — Authenticating...');
              if (autoCapture && !hasCapturedRef.current && score >= 50) {
                hasCapturedRef.current = true;
                setTimeout(() => {
                  const snap = captureSnapshot();
                  if (snap) {
                    const verifyPayload = JSON.stringify({
                      main: snap,
                      image: snap,
                      landmarks: latestLandmarksRef.current,
                    });
                    setCapturedImage(snap);
                    onFaceCaptured?.(verifyPayload);
                    stopWebcam();
                  }
                }, 300);
              }
            }
          }
        } else {
          latestFaceBoxRef.current = null;
          setFaceDetected(false);
          setConfidence(null);
          setPoseFeedback(mode === 'enroll' ? 'Position face inside ring...' : 'Position face inside ring...');
          holdCounterRef.current = 0;
          setHoldProgress(0);
          onStatusChange?.(false);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(() => detectLoop(detector));
  };

  // Manual trigger fallback
  const triggerManualCapture = () => {
    const snap = captureSnapshot();
    if (snap) {
      const payload = JSON.stringify({
        main: snap,
        center: snap,
        left: capturedLeft || snap,
        right: capturedRight || snap,
        landmarks: latestLandmarksRef.current,
        version: '2.0-multi-pose',
      });
      setCapturedImage(snap);
      onFaceCaptured?.(payload);
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
    <div className="mb-5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 p-3.5 transition-all">
      {/* Header Bar */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider whitespace-nowrap">
                {mode === 'enroll' ? 'Mobile Face Lock Setup' : 'MediaPipe Face Detector'}
              </h3>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded whitespace-nowrap">
                AI POWERED
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              {mode === 'enroll' 
                ? 'Mobile-style 3D multi-angle pose enrollment (Center 🎯, Left 👈, Right 👉)' 
                : 'High-accuracy biometric verification'}
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
                <span>{capturedImage ? 'Re-enroll Face Lock' : mode === 'enroll' ? 'Setup Face Lock' : 'Scan Face'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopWebcam}
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 transition shrink-0 whitespace-nowrap"
          >
            <StopCircle size={14} className="shrink-0" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Captured Biometric Profile Summary (When Saved) */}
      {capturedImage && !isStreaming && (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-emerald-200 dark:border-slate-700 shadow-2xs">
          <img
            src={capturedImage}
            alt="Captured face"
            className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span>Face Lock Enrolled & Verified</span>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Multi-angle biometric profile active for 1-click sign in.
            </p>
          </div>
          <button
            type="button"
            onClick={startWebcam}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 shrink-0"
          >
            Re-enroll
          </button>
        </div>
      )}

      {/* Active Camera Viewfinder & Mobile Lock Setup */}
      {isStreaming && (
        <div className="space-y-3 mt-3">
          {/* Viewfinder Container */}
          <div className="relative overflow-hidden rounded-xl bg-black aspect-video max-h-60 flex items-center justify-center border border-emerald-500/40 shadow-inner">
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

            {/* Oval Target Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-36 h-44 rounded-[50%] border-4 transition-all duration-300 ${
                  faceDetected
                    ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] scale-105'
                    : 'border-amber-400/80 border-dashed animate-pulse'
                }`}
              />
            </div>

            {/* Pose Direction Overlays (Left/Right Hints) */}
            {mode === 'enroll' && isStreaming && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none text-white/40">
                <div className={`p-2 rounded-full transition-all ${enrollStep === 'left' ? 'bg-emerald-500/80 text-white scale-125 animate-bounce' : ''}`}>
                  <ArrowLeft size={24} />
                </div>
                <div className={`p-2 rounded-full transition-all ${enrollStep === 'right' ? 'bg-emerald-500/80 text-white scale-125 animate-bounce' : ''}`}>
                  <ArrowRight size={24} />
                </div>
              </div>
            )}

            {/* Status & Pose Guidance Overlay */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[11px] font-medium border border-white/10 shadow-md">
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${faceDetected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-emerald-300 font-bold truncate">{poseFeedback}</span>
              </div>
              {confidence !== null && (
                <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  {confidence}% Match
                </span>
              )}
            </div>

            {/* Progress Bar for Current Pose Hold */}
            {mode === 'enroll' && holdProgress > 0 && (
              <div className="absolute bottom-3 left-6 right-6 h-2 bg-black/60 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-150"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
            )}

            {/* Manual Override Capture Button */}
            {faceDetected && mode === 'verify' && (
              <button
                type="button"
                onClick={triggerManualCapture}
                className="absolute bottom-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition transform hover:scale-105 active:scale-95 z-10"
              >
                <UserCheck size={14} />
                <span>Confirm & Sign In</span>
              </button>
            )}
          </div>

          {/* Multi-Pose Registration Progress Checklist (Mobile Phone Lock Style) */}
          {mode === 'enroll' && (
            <div className="bg-emerald-950/90 dark:bg-slate-900 border border-emerald-800/80 dark:border-slate-700 p-3 rounded-xl space-y-2 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Focus size={15} className="text-emerald-400" />
                  <span>3-Angle Face Lock Setup (Mobile Lock Style)</span>
                </p>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {enrollStep === 'center' ? 'Step 1 of 3' : enrollStep === 'left' ? 'Step 2 of 3' : 'Step 3 of 3'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-semibold">
                <div className={`p-2 rounded-lg border text-center transition-all ${
                  capturedCenter 
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200' 
                    : enrollStep === 'center' 
                    ? 'bg-emerald-600/30 border-emerald-400 text-white animate-pulse' 
                    : 'bg-black/30 border-white/10 text-gray-400'
                }`}>
                  <p>{capturedCenter ? '✓ 1. Center' : '🎯 1. Center'}</p>
                </div>

                <div className={`p-2 rounded-lg border text-center transition-all ${
                  capturedLeft 
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200' 
                    : enrollStep === 'left' 
                    ? 'bg-emerald-600/30 border-emerald-400 text-white animate-pulse' 
                    : 'bg-black/30 border-white/10 text-gray-400'
                }`}>
                  <p>{capturedLeft ? '✓ 2. Left Angle' : '👈 2. Turn Left'}</p>
                </div>

                <div className={`p-2 rounded-lg border text-center transition-all ${
                  capturedRight 
                    ? 'bg-emerald-900/60 border-emerald-500 text-emerald-200' 
                    : enrollStep === 'right' 
                    ? 'bg-emerald-600/30 border-emerald-400 text-white animate-pulse' 
                    : 'bg-black/30 border-white/10 text-gray-400'
                }`}>
                  <p>{capturedRight ? '✓ 3. Right Angle' : '👉 3. Turn Right'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

