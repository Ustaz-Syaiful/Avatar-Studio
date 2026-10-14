import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  FlipHorizontal,
  Clock,
  HelpCircle,
  Video,
  VideoOff,
  SwitchCamera,
  X,
  ExternalLink,
} from 'lucide-react';
import { playCameraShutterSound, playCountdownTick, playSuccessChime } from '../utils/audio';
import { detectFace, DetectedFaceBox } from '../utils/faceDetector';
import { removePortraitBackground } from '../utils/backgroundRemoval';

interface Step1CameraProps {
  onFaceCaptured: (image: HTMLImageElement, detectedFace?: DetectedFaceBox | null) => void;
  capturedImage: HTMLImageElement | null;
  onNext: () => void;
}

interface VideoDevice {
  deviceId: string;
  label: string;
}

export const Step1Camera: React.FC<Step1CameraProps> = ({
  onFaceCaptured,
  capturedImage,
  onNext,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [timerSetting, setTimerSetting] = useState<0 | 3 | 5>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string | null>(null);
  const [cutoutPhotoSrc, setCutoutPhotoSrc] = useState<string | null>(null);
  const [isShowingCutout, setIsShowingCutout] = useState(true);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [detectedFaceBox, setDetectedFaceBox] = useState<DetectedFaceBox | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Available camera devices list
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // Enumerate video devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Kamera ${index + 1}`,
        }));
      setVideoDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (e) {
      console.warn('Could not list video devices:', e);
    }
  }, [selectedDeviceId]);

  // Clean up camera stream helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsVideoPlaying(false);
  }, []);

  // Initialize preview if image was already captured previously
  useEffect(() => {
    if (capturedImage) {
      setPreviewSrc(capturedImage.src);
    }
  }, [capturedImage]);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Attempt auto-starting camera on mount after 300ms
  useEffect(() => {
    if (!capturedImage) {
      const timer = setTimeout(() => {
        startCamera();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  // Hook up video stream safely to video element
  const attachStreamToVideo = useCallback((stream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsVideoPlaying(true);
        })
        .catch((playErr) => {
          console.warn('Auto-play was blocked or failed, retrying on user click:', playErr);
          // Try playing again without mute conflict
          video.muted = true;
          video.play().catch(() => {});
        });
    }
  }, []);

  // Start webcam feed with multi-tier fallback
  const startCamera = async (deviceIdToUse?: string) => {
    setCameraError(null);
    setCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Pelayar web (browser) ini tidak menyokong fungsi webcam atau akses kamera disekat oleh sistem. Sila gunakan fungsi muat naik fail gambar di bawah.'
      );
      setCameraLoading(false);
      return;
    }

    // Stop current stream first
    stopCameraStream();

    const targetDeviceId = deviceIdToUse || selectedDeviceId;

    try {
      let stream: MediaStream;

      // Tier 1: Try with preferred HD resolution
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined,
            facingMode: targetDeviceId ? undefined : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (tier1Error) {
        console.warn('Preferred constraints failed, trying basic fallback:', tier1Error);
        // Tier 2: Try basic video constraint without resolution restrictions
        const fallbackConstraints: MediaStreamConstraints = {
          video: targetDeviceId ? { deviceId: { exact: targetDeviceId } } : true,
          audio: false,
        };
        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setPreviewSrc(null);

      // Attach stream to video element
      attachStreamToVideo(stream);

      // Refresh device list after permission is granted (to get real labels)
      updateDeviceList();
    } catch (err: unknown) {
      console.error('Camera access failed:', err);
      const error = err as { name?: string; message?: string };
      const errName = error.name || '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError(
          'Kebenaran kamera disekat (Permission Denied). Sila klik ikon kamera atau ikon mangga kunci pada palang URL di atas pelayar web anda, pilih "Benarkan" (Allow), dan tekan "Aktifkan Kamera" semula.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError(
          'Tiada peranti webcam dikesan pada komputer ini. Sila semak sambungan USB webcam atau gunakan butang "Muat Naik Gambar".'
        );
      } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
        setCameraError(
          'Kamera anda sedang digunakan oleh program lain (seperti Zoom, Google Meet, Teams, atau aplikasi kamera Windows). Sila tutup aplikasi tersebut dan cuba lagi.'
        );
      } else if (errName === 'OverconstrainedError') {
        setCameraError(
          'Resolusi kamera tidak disokong. Sila pilih peranti kamera lain atau muat naik foto.'
        );
      } else {
        setCameraError(
          'Kamera tidak dapat diaktifkan. Sila semak kebenaran pelayar web atau gunakan butang muat naik gambar di bawah.'
        );
      }
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  // Switch between cameras if multiple exist
  const handleSwitchCamera = async (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    if (isCameraActive) {
      await startCamera(newDeviceId);
    }
  };

  // Perform the capture snapshot from video
  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Audio & Flash animation
    playCameraShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 250);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setRawPhotoSrc(dataUrl);
    setPreviewSrc(dataUrl);

    // Stop active video track after capturing
    stopCameraStream();

    // Load as HTMLImageElement for state
    const rawImg = new Image();
    rawImg.onload = async () => {
      setIsDetectingFace(true);
      try {
        const faceBox = await detectFace(rawImg);
        setDetectedFaceBox(faceBox);

        // Remove background automatically to isolate only the face & head
        const cutoutCanvas = await removePortraitBackground(rawImg, faceBox, {
          featherRadius: 20,
          headExpansion: 1.25,
        });

        const cutoutDataUrl = cutoutCanvas.toDataURL('image/png');
        setCutoutPhotoSrc(cutoutDataUrl);
        setPreviewSrc(cutoutDataUrl);
        setIsShowingCutout(true);

        // Pass the transparent face cutout to the app state
        const cutoutImg = new Image();
        cutoutImg.onload = () => {
          onFaceCaptured(cutoutImg, faceBox);
          playSuccessChime();
        };
        cutoutImg.src = cutoutDataUrl;
      } catch (e) {
        console.warn('Face cutout processing error:', e);
        onFaceCaptured(rawImg, null);
      } finally {
        setIsDetectingFace(false);
      }
    };
    rawImg.src = dataUrl;
  };

  // Trigger capture with optional countdown
  const handleCaptureClick = () => {
    if (timerSetting === 0) {
      captureSnapshot();
      return;
    }

    setCountdown(timerSetting);
    playCountdownTick(false);

    let current = timerSetting;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
        playCountdownTick(false);
      } else {
        clearInterval(interval);
        setCountdown(null);
        playCountdownTick(true);
        captureSnapshot();
      }
    }, 1000);
  };

  // Retake photo
  const handleRetake = () => {
    setPreviewSrc(null);
    setRawPhotoSrc(null);
    setCutoutPhotoSrc(null);
    setDetectedFaceBox(null);
    startCamera();
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej yang sah (JPG, PNG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setRawPhotoSrc(result);
      setPreviewSrc(result);

      const rawImg = new Image();
      rawImg.onload = async () => {
        setIsDetectingFace(true);
        try {
          const faceBox = await detectFace(rawImg);
          setDetectedFaceBox(faceBox);

          // Automatically remove background to isolate face
          const cutoutCanvas = await removePortraitBackground(rawImg, faceBox, {
            featherRadius: 20,
            headExpansion: 1.25,
          });

          const cutoutDataUrl = cutoutCanvas.toDataURL('image/png');
          setCutoutPhotoSrc(cutoutDataUrl);
          setPreviewSrc(cutoutDataUrl);
          setIsShowingCutout(true);

          const cutoutImg = new Image();
          cutoutImg.onload = () => {
            onFaceCaptured(cutoutImg, faceBox);
            stopCameraStream();
            playSuccessChime();
          };
          cutoutImg.src = cutoutDataUrl;
        } catch (e) {
          console.warn('Face cutout processing error:', e);
          onFaceCaptured(rawImg, null);
          stopCameraStream();
        } finally {
          setIsDetectingFace(false);
        }
      };
      rawImg.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Step Guide Banner */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Langkah 1 daripada 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Ambil Gambar Wajah Anda
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mt-1">
          Posisikan wajah anda di tengah bulatan, senyum manis dan ambil gambar menggunakan webcam atau muat naik foto dari komputer.
        </p>
      </div>

      {/* Main Viewport Container */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 overflow-hidden">
        <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 flex items-center justify-center overflow-hidden">
          
          {/* Shutter Flash Overlay */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-40 animate-shutter-flash pointer-events-none" />
          )}

          {/* Countdown Indicator */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <div className="w-28 h-28 rounded-full bg-white/95 text-indigo-700 font-black text-6xl flex items-center justify-center shadow-2xl animate-bounce font-heading">
                {countdown}
              </div>
            </div>
          )}

          {/* Live Video Element ALWAYS actively laid out in DOM without display:none to ensure browser decodes frames */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              videoRef.current?.play().then(() => setIsVideoPlaying(true)).catch(() => {});
            }}
            onCanPlay={() => {
              setIsVideoPlaying(true);
            }}
            className={`absolute inset-0 w-full h-full object-cover transition-transform ${
              isMirrored ? '-scale-x-100' : ''
            } ${isCameraActive && !previewSrc ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}
          />

          {/* 1. Captured Photo Preview with Instant Background Cutout */}
          {previewSrc && (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 z-20">
              {/* Checkerboard transparency pattern backdrop to showcase isolated face cutout */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)`,
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
                }}
              />

              <img
                src={previewSrc}
                alt="Gambar Pratonton Wajah"
                className="max-h-full max-w-full object-contain relative z-10 drop-shadow-2xl"
              />
              
              {/* Top Left Status Badges */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <div className="bg-emerald-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Check className="w-3.5 h-3.5" /> Gambar Berjaya Diambil
                </div>
                
                {isDetectingFace ? (
                  <div className="bg-indigo-600/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" /> Mengasingkan wajah & memadam latar...
                  </div>
                ) : (
                  <div className="bg-blue-600/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Latar Belakang Dipadam • Hanya Wajah Dikekalkan</span>
                  </div>
                )}
              </div>

              {/* Top Right: Cutout vs Original Toggle */}
              {rawPhotoSrc && cutoutPhotoSrc && !isDetectingFace && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      setIsShowingCutout(true);
                      setPreviewSrc(cutoutPhotoSrc);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isShowingCutout ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    ✂️ Hanya Wajah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsShowingCutout(false);
                      setPreviewSrc(rawPhotoSrc);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !isShowingCutout ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    📷 Foto Asal
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. Live Camera Overlay Guide (Shown only when camera is active and playing) */}
          {isCameraActive && !previewSrc && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {/* Face Guide Oval Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-52 sm:w-64 h-68 sm:h-80 border-4 border-dashed border-amber-300/80 rounded-[50%] shadow-lg shadow-black/20 flex items-center justify-center">
                  <div className="text-center bg-black/50 px-3 py-1 rounded-full text-amber-200 text-xs font-semibold backdrop-blur-xs">
                    Letakkan Wajah Di Sini
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                {isVideoPlaying ? 'Kamera Langsung Aktif' : 'Menyambung Kamera...'}
              </div>

              {/* Mirror Toggle Button */}
              <div className="absolute top-4 right-4 pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-xl backdrop-blur-md text-xs font-medium flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  title="Cerminkan Pratonton (Mirror)"
                >
                  <FlipHorizontal className="w-4 h-4 text-cyan-300" />
                  <span className="hidden sm:inline">{isMirrored ? 'Bercermin' : 'Biasa'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Inactive State (Show when camera is off and no preview photo) */}
          {!isCameraActive && !previewSrc && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`p-6 sm:p-10 text-center flex flex-col items-center justify-center max-w-lg w-full transition-colors z-20 ${
                dragOver ? 'border-4 border-dashed border-amber-400 bg-slate-900/90' : ''
              }`}
            >
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-4 ring-8 ring-indigo-500/10">
                <Camera className="w-10 h-10" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Webcam Sedang Bersedia
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
                Tekan <strong>“Aktifkan Kamera”</strong> untuk membuka paparan webcam anda, atau muat naik foto terus dari komputer.
              </p>

              {/* Camera Error Message Box */}
              {cameraError && (
                <div className="mb-5 p-3.5 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-left text-xs text-rose-200 flex items-start gap-2.5 w-full">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold text-rose-300 block mb-0.5">
                      Status Kamera:
                    </strong>
                    <p className="leading-relaxed">{cameraError}</p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="text-amber-300 hover:text-amber-200 underline font-bold flex items-center gap-1 cursor-pointer text-xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Panduan Kebenaran Kamera</span>
                      </button>
                      
                      <a
                        href={window.location.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 hover:text-cyan-200 underline font-bold flex items-center gap-1 cursor-pointer text-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Di Tab Baharu</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  disabled={cameraLoading}
                  className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-75"
                >
                  <Video className="w-5 h-5 text-amber-300" />
                  <span>{cameraLoading ? 'Menyambungkan Kamera...' : 'Aktifkan Kamera Sekarang'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-cyan-300" />
                  <span>Muat Naik Foto</span>
                </button>
              </div>

              {/* Device Selector (If multiple cameras detected) */}
              {videoDevices.length > 1 && (
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <SwitchCamera className="w-3.5 h-3.5" />
                  <span>Pilihan Kamera:</span>
                  <select
                    value={selectedDeviceId}
                    onChange={(e) => handleSwitchCamera(e.target.value)}
                    className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1 text-xs"
                  >
                    {videoDevices.map((dev) => (
                      <option key={dev.deviceId} value={dev.deviceId}>
                        {dev.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Toolbar Below Viewport */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Secondary actions & timer */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ganti dengan Fail Foto</span>
            </button>

            {/* Help button */}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Bantuan Kamera</span>
            </button>

            {/* Timer Settings (Only when camera active) */}
            {isCameraActive && !previewSrc && (
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <button
                  type="button"
                  onClick={() => setTimerSetting(0)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    timerSetting === 0 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  0s
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSetting(3)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    timerSetting === 3 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  3s
                </button>
                <button
                  type="button"
                  onClick={() => setTimerSetting(5)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    timerSetting === 5 ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  5s
                </button>
              </div>
            )}
          </div>

          {/* Right: Primary Capture / Review Action */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            {previewSrc ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  <span>Ambil Semula</span>
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="px-6 py-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform active:scale-98 cursor-pointer"
                >
                  <span>Gunakan Gambar Ini</span>
                  <Check className="w-4 h-4" />
                </button>
              </>
            ) : isCameraActive ? (
              <button
                type="button"
                onClick={handleCaptureClick}
                disabled={countdown !== null}
                className="px-8 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-base shadow-xl shadow-indigo-500/30 flex items-center gap-3 transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full bg-white" />
                </div>
                <span>{timerSetting > 0 ? `Ambil Gambar (${timerSetting}s)` : 'Ambil Gambar Sekarang'}</span>
              </button>
            ) : null}
          </div>

        </div>
      </div>

      {/* Helpful Tips Card */}
      <div className="mt-6 bg-blue-50/80 border border-blue-100 rounded-2xl p-4 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div>
          <strong className="font-bold block mb-0.5">Petua untuk Gambar Terbaik:</strong>
          Jika anda menggunakan komputer riba di dalam bilik darjah atau rumah, pastikan anda menghadap sumber cahaya (seperti lampu atau tingkap) supaya wajah anda jelas dan terang!
        </div>
      </div>

      {/* Camera Troubleshooting Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Camera className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2">
              Panduan Mengapa Kamera Tidak Muncul
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Jika video webcam masih tidak memaparkan gambar, berikut adalah 4 punca biasa dan cara mudah mengatasinya:
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="font-bold text-indigo-700 block mb-1">
                  1. Kebenaran Kamera Pelayar (Permission) Disenyapkan
                </strong>
                Lihat di bahagian atas pelayar web anda (di sebelah kiri alamat laman web). Klik pada <strong>ikon mangga kunci 🔒 atau ikon kamera 📷</strong>, kemudian pastikan pilihan <strong>Kamera (Camera)</strong> ditetapkan kepada <strong>"Benarkan" (Allow)</strong>.
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="font-bold text-indigo-700 block mb-1">
                  2. Suis Penutup Fizikal Webcam (Privacy Shutter)
                </strong>
                Banyak komputer riba moden (seperti Lenovo, HP, Dell) mempunyai suis penggeser kecil berwarna oren/merah di atas lensa webcam. Pastikan suis tersebut dibuka.
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <strong className="font-bold text-indigo-700 block mb-1">
                  3. Kamera Sedang Digunakan Aplikasi Lain
                </strong>
                Jika aplikasi seperti Google Meet, Zoom, Microsoft Teams atau Camera Windows sedang aktif di latar belakang, tutup aplikasi tersebut kerana hanya satu program boleh menggunakan webcam pada satu masa.
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 text-indigo-900">
                <strong className="font-bold block mb-1">
                  4. Penyelesaian Paling Cepat: Muat Naik Fail Foto
                </strong>
                Anda tidak wajib menggunakan webcam! Anda boleh menekan butang <strong>"Muat Naik Foto"</strong> untuk memilih mana-mana gambar wajah sedia ada dari komputer anda.
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false);
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Guna Fail Gambar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHelpModal(false);
                  startCamera();
                }}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                Cuba Aktifkan Semula
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
