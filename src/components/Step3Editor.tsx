import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  AvatarItem,
  EditorSettings,
  FaceTransform,
} from '../types';
import {
  BACKGROUND_OPTIONS,
  FRAME_OPTIONS,
  QUICK_SLOGANS,
  AVATARS,
} from '../data/avatars';
import { renderCompositeAvatar } from '../utils/canvasRenderer';
import { detectFace, calculateFaceAutoFit } from '../utils/faceDetector';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sun,
  Palette,
  Type,
  Square,
  Sparkles,
  Camera,
  Check,
  Trash2,
  Sliders,
  FlipHorizontal,
} from 'lucide-react';

interface Step3EditorProps {
  avatar: AvatarItem;
  faceImage: HTMLImageElement | null;
  settings: EditorSettings;
  onChangeSettings: (settings: EditorSettings) => void;
  onSelectAvatar: (avatar: AvatarItem) => void;
  onBackToCamera: () => void;
  onNext: () => void;
}

export const Step3Editor: React.FC<Step3EditorProps> = ({
  avatar,
  faceImage,
  settings,
  onChangeSettings,
  onSelectAvatar,
  onBackToCamera,
  onNext,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'face' | 'background' | 'frame' | 'text'>('face');
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoFitting, setIsAutoFitting] = useState(false);
  const [autoFitSuccessMsg, setAutoFitSuccessMsg] = useState<string | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; initOffsetX: number; initOffsetY: number }>({
    x: 0,
    y: 0,
    initOffsetX: 0,
    initOffsetY: 0,
  });

  const handleAutoFitNow = async () => {
    if (!faceImage) return;
    setIsAutoFitting(true);
    try {
      const faceBox = await detectFace(faceImage);
      const imgW = faceImage.naturalWidth || faceImage.width || 640;
      const imgH = faceImage.naturalHeight || faceImage.height || 480;
      const fit = calculateFaceAutoFit(faceBox, imgW, imgH, avatar.faceHole);

      onChangeSettings({
        ...settings,
        faceTransform: {
          ...settings.faceTransform,
          scale: fit.scale,
          offsetX: fit.offsetX,
          offsetY: fit.offsetY,
          rotation: 0,
        },
      });

      setAutoFitSuccessMsg('Wajah berjaya dipadankan secara automatik ke dalam avatar 3D!');
      setTimeout(() => setAutoFitSuccessMsg(null), 3500);
    } catch (e) {
      console.warn('Auto fit error:', e);
    } finally {
      setIsAutoFitting(false);
    }
  };

  // Re-render canvas whenever settings, avatar, or faceImage changes
  const updateCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    await renderCompositeAvatar(
      canvasRef.current,
      avatar,
      faceImage,
      settings,
      600,
      900
    );
  }, [avatar, faceImage, settings]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  // Helpers to update partial transforms
  const updateFaceTransform = (delta: Partial<FaceTransform>) => {
    onChangeSettings({
      ...settings,
      faceTransform: {
        ...settings.faceTransform,
        ...delta,
      },
    });
  };

  // Reset face position & scale
  const handleResetFace = () => {
    updateFaceTransform({
      scale: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false,
      brightness: 100,
      contrast: 100,
    });
  };

  // Nudge directional movements
  const nudgeFace = (dx: number, dy: number) => {
    updateFaceTransform({
      offsetX: Math.max(-250, Math.min(250, settings.faceTransform.offsetX + dx)),
      offsetY: Math.max(-250, Math.min(250, settings.faceTransform.offsetY + dy)),
    });
  };

  // Interactive mouse/touch dragging on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initOffsetX: settings.faceTransform.offsetX,
      initOffsetY: settings.faceTransform.offsetY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleFactor = 600 / canvas.clientWidth;
    const dx = (e.clientX - dragStartRef.current.x) * scaleFactor;
    const dy = (e.clientY - dragStartRef.current.y) * scaleFactor;

    updateFaceTransform({
      offsetX: Math.max(-250, Math.min(250, Math.round(dragStartRef.current.initOffsetX + dx))),
      offsetY: Math.max(-250, Math.min(250, Math.round(dragStartRef.current.initOffsetY + dy))),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile & tablets
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        initOffsetX: settings.faceTransform.offsetX,
        initOffsetY: settings.faceTransform.offsetY,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleFactor = 600 / canvas.clientWidth;
    const dx = (e.touches[0].clientX - dragStartRef.current.x) * scaleFactor;
    const dy = (e.touches[0].clientY - dragStartRef.current.y) * scaleFactor;

    updateFaceTransform({
      offsetX: Math.max(-250, Math.min(250, Math.round(dragStartRef.current.initOffsetX + dx))),
      offsetY: Math.max(-250, Math.min(250, Math.round(dragStartRef.current.initOffsetY + dy))),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Step Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Langkah 3 daripada 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Sunting & Laraskan Avatar
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-1">
          Sesuaikan saiz dan kedudukan wajah supaya padan sempurna dengan pakaian, pilih latar belakang kegemaran dan letakkan nama anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Column: Live Canvas Preview Area (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 w-full max-w-md">
            <div className="relative aspect-2/3 w-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`w-full h-full object-contain ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              />

              {/* Drag Hint Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                <Move className="w-3 h-3 text-amber-300" />
                <span>Seret wajah untuk alih</span>
              </div>

              {/* Current Avatar Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-slate-200">
                {avatar.name}
              </div>
            </div>

            {/* Quick action shortcuts under canvas */}
            <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={onBackToCamera}
                className="px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ambil Semula Foto</span>
              </button>

              <button
                type="button"
                onClick={handleResetFace}
                className="px-3 py-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Laraskan Semula</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Tabs & Control Panels (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
          
          {/* Editor Category Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto bg-slate-50/70 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('face')}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'face'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>1. Laraskan Wajah</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'background'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Palette className="w-4 h-4 text-pink-600" />
              <span>2. Latar Belakang</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('frame')}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'frame'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Square className="w-4 h-4 text-amber-500" />
              <span>3. Bingkai</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'text'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
              }`}
            >
              <Type className="w-4 h-4 text-emerald-600" />
              <span>4. Nama & Slogan</span>
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="p-4 sm:p-6 min-h-[380px]">
            
            {/* TAB 1: PELARASAN WAJAH */}
            {activeTab === 'face' && (
              <div className="space-y-6">
                
                {/* Auto-Fit 3D Button & Detection Banner */}
                <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 p-3.5 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                      <span>Kesan & Padankan Wajah Automatik</span>
                    </div>
                    <p className="text-[11px] text-indigo-700/80 mt-0.5">
                      Sistem mengesan kedudukan mata dan dagu untuk padanan 3D yang tepat.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFitNow}
                    disabled={isAutoFitting || !faceImage}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-indigo-300 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAutoFitting ? 'Mengesan...' : 'Auto-Fit Wajah 3D'}</span>
                  </button>
                </div>

                {autoFitSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{autoFitSuccessMsg}</span>
                  </div>
                )}

                {/* 1. Zoom / Scale */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ZoomIn className="w-4 h-4 text-indigo-600" />
                      <span>Saiz Wajah (Besarkan / Kecilkan):</span>
                    </label>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {Math.round(settings.faceTransform.scale * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.02"
                      value={settings.faceTransform.scale}
                      onChange={(e) => updateFaceTransform({ scale: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* 2. Directional Movement Pad */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Move className="w-4 h-4 text-indigo-600" />
                      <span>Gerakkan Kedudukan Wajah:</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      X: {settings.faceTransform.offsetX} | Y: {settings.faceTransform.offsetY}
                    </span>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1.5 w-44">
                      <div />
                      <button
                        type="button"
                        onClick={() => nudgeFace(0, -10)}
                        className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-slate-700 hover:text-indigo-600 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Gerak Ke Atas"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <div />

                      <button
                        type="button"
                        onClick={() => nudgeFace(-10, 0)}
                        className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-slate-700 hover:text-indigo-600 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Gerak Ke Kiri"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFaceTransform({ offsetX: 0, offsetY: 0 })}
                        className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 text-xs font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                        title="Kembali Ke Tengah"
                      >
                        Tengah
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeFace(10, 0)}
                        className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-slate-700 hover:text-indigo-600 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Gerak Ke Kanan"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div />
                      <button
                        type="button"
                        onClick={() => nudgeFace(0, 10)}
                        className="p-2.5 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-slate-700 hover:text-indigo-600 flex items-center justify-center shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="Gerak Ke Bawah"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <div />
                    </div>
                  </div>
                </div>

                {/* 3. Rotation Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <RotateCw className="w-4 h-4 text-indigo-600" />
                      <span>Putaran Wajah:</span>
                    </label>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {settings.faceTransform.rotation}°
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-bold">-45°</span>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      step="1"
                      value={settings.faceTransform.rotation}
                      onChange={(e) => updateFaceTransform({ rotation: parseInt(e.target.value) })}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-bold">+45°</span>
                  </div>
                </div>

                {/* 4. Flip & Lighting Filters */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => updateFaceTransform({ flipH: !settings.faceTransform.flipH })}
                    className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.faceTransform.flipH
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span>{settings.faceTransform.flipH ? 'Wajah Dibalikkan' : 'Balikkan Wajah (Flip)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextBrightness = settings.faceTransform.brightness === 115 ? 100 : 115;
                      updateFaceTransform({ brightness: nextBrightness });
                    }}
                    className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      settings.faceTransform.brightness > 100
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>{settings.faceTransform.brightness > 100 ? 'Pencahayaan Cerah' : 'Terangkan Wajah'}</span>
                  </button>
                </div>

                {/* 5. Auto Background Removal & Feather Control */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Buang Latar Belakang Bilik (Auto Background Removal):</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.faceTransform.removeBackground}
                        onChange={(e) => updateFaceTransform({ removeBackground: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-indigo-700">
                        {settings.faceTransform.removeBackground ? 'Aktif' : 'Tutup'}
                      </span>
                    </label>
                  </div>

                  {settings.faceTransform.removeBackground && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Kehalusan Sisi Wajah (Feather Edge):</span>
                        <span className="font-bold text-indigo-600">{settings.faceTransform.bgFeather || 20}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="35"
                        step="2"
                        value={settings.faceTransform.bgFeather || 20}
                        onChange={(e) => updateFaceTransform({ bgFeather: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Avatar Switcher Carousel */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 block mb-2">
                    Tukar Watak Lain Secara Pantas:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => onSelectAvatar(av)}
                        className={`shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          av.id === avatar.id
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        {av.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: LATAR BELAKANG */}
            {activeTab === 'background' && (
              <div className="space-y-5">
                <span className="text-xs font-bold text-slate-500 block">
                  Pilih Warna & Corak Latar Belakang:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {BACKGROUND_OPTIONS.map((bg) => {
                    const isSelected = settings.background.id === bg.id;
                    return (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => onChangeSettings({ ...settings, background: bg })}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200 scale-102'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div
                          className="w-full h-9 rounded-xl border border-black/10 shadow-inner"
                          style={{
                            background: bg.gradient || bg.bgColor,
                          }}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {bg.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: BINGKAI GAMBAR */}
            {activeTab === 'frame' && (
              <div className="space-y-5">
                <span className="text-xs font-bold text-slate-500 block">
                  Pilih Gaya Bingkai Foto:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FRAME_OPTIONS.map((fr) => {
                    const isSelected = settings.frame === fr.id;
                    return (
                      <button
                        key={fr.id}
                        type="button"
                        onClick={() => onChangeSettings({ ...settings, frame: fr.id })}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                          isSelected
                            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-200 scale-102'
                            : 'border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className={`w-full h-9 rounded-xl bg-slate-100 flex items-center justify-center ${fr.previewClass}`}>
                          <span className="text-[10px] text-slate-400 font-bold">Bingkai</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-bold text-slate-800">
                            {fr.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: TEKS, NAMA & SLOGAN */}
            {activeTab === 'text' && (
              <div className="space-y-6">
                
                {/* 1. Nama Pengguna */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-indigo-600" />
                      <span>Nama Murid / Pengguna:</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-500 font-semibold">Tunjukkan</span>
                      <input
                        type="checkbox"
                        checked={settings.text.showUserName}
                        onChange={(e) =>
                          onChangeSettings({
                            ...settings,
                            text: { ...settings.text, showUserName: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    maxLength={24}
                    placeholder="Contoh: AIMAN HAKIM"
                    value={settings.text.userName}
                    onChange={(e) =>
                      onChangeSettings({
                        ...settings,
                        text: { ...settings.text, userName: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:outline-indigo-600 focus:ring-2 focus:ring-indigo-100 uppercase"
                  />

                  {/* Name text color options */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-semibold">Warna Fon:</span>
                    {['#ffffff', '#fde047', '#38bdf8', '#f472b6', '#a7f3d0'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          onChangeSettings({
                            ...settings,
                            text: { ...settings.text, nameColor: color },
                          })
                        }
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          settings.text.nameColor === color
                            ? 'scale-115 border-indigo-600 shadow-xs'
                            : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Slogan Hiasan / Ucapan */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Slogan / Kata Semangat:</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-slate-500 font-semibold">Tunjukkan</span>
                      <input
                        type="checkbox"
                        checked={settings.text.showSlogan}
                        onChange={(e) =>
                          onChangeSettings({
                            ...settings,
                            text: { ...settings.text, showSlogan: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Contoh: Saya Hebat! 🌟"
                    value={settings.text.sloganText}
                    onChange={(e) =>
                      onChangeSettings({
                        ...settings,
                        text: { ...settings.text, sloganText: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-sm focus:outline-indigo-600 focus:ring-2 focus:ring-indigo-100"
                  />

                  {/* Quick Slogan Suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {QUICK_SLOGANS.map((slogan) => (
                      <button
                        key={slogan}
                        type="button"
                        onClick={() =>
                          onChangeSettings({
                            ...settings,
                            text: {
                              ...settings.text,
                              sloganText: slogan,
                              showSlogan: true,
                            },
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-[11px] font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {slogan}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Text button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      onChangeSettings({
                        ...settings,
                        text: {
                          ...settings.text,
                          userName: '',
                          sloganText: 'Saya Hebat! 🌟',
                          showUserName: false,
                          showSlogan: true,
                        },
                      })
                    }
                    className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Padam Semua Teks</span>
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Bar: Proceed to Step 4 */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Semua suntingan dikemas kini secara automatik.
            </span>

            <button
              type="button"
              onClick={onNext}
              className="px-8 py-3 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>Avatar Sudah Siap! Lihat & Cetak</span>
              <Check className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
