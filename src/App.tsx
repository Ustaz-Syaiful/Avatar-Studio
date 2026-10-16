import React, { useState, useEffect, useCallback } from 'react';
import { Step, AvatarItem, EditorSettings, PrintLayoutMode } from './types';
import { AVATARS, BACKGROUND_OPTIONS } from './data/avatars';
import { Header } from './components/Header';
import { Step1Camera } from './components/Step1Camera';
import { Step2AvatarPicker } from './components/Step2AvatarPicker';
import { Step3Editor } from './components/Step3Editor';
import { Step4DownloadPrint } from './components/Step4DownloadPrint';
import { PrintSheet } from './components/PrintSheet';
import { GalleryModal } from './components/GalleryModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Sparkles, Shield, Camera, Heart, CheckCircle, Database } from 'lucide-react';
import { calculateFaceAutoFit, DetectedFaceBox } from './utils/faceDetector';
import { getSupabaseConfig, fetchAllAvatars } from './utils/supabaseService';

const INITIAL_SETTINGS: EditorSettings = {
  avatarId: AVATARS[0].id,
  faceTransform: {
    scale: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    flipH: false,
    brightness: 100,
    contrast: 100,
    removeBackground: true,
    bgFeather: 20,
  },
  background: BACKGROUND_OPTIONS[0],
  frame: 'gold',
  text: {
    userName: '',
    showUserName: false,
    nameColor: '#ffffff',
    nameSize: 32,
    sloganText: 'Saya Hebat! 🌟',
    showSlogan: true,
    sloganColor: '#78350f',
    sloganBgColor: '#facc15',
    bannerStyle: 'ribbon',
  },
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('camera');
  const [capturedFace, setCapturedFace] = useState<HTMLImageElement | null>(null);
  const [detectedFaceBox, setDetectedFaceBox] = useState<DetectedFaceBox | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem>(AVATARS[0]);
  const [settings, setSettings] = useState<EditorSettings>(INITIAL_SETTINGS);
  
  // Printing states
  const [printLayout, setPrintLayout] = useState<PrintLayoutMode>('single_full');
  const [printImageUrl, setPrintImageUrl] = useState<string>('');

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

  // Database / Supabase states
  const [savedCount, setSavedCount] = useState(0);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const refreshSavedCount = useCallback(async () => {
    try {
      const cfg = getSupabaseConfig();
      setIsSupabaseConnected(Boolean(cfg.url && cfg.anonKey));
      const res = await fetchAllAvatars();
      setSavedCount(res.records.length);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    refreshSavedCount();
  }, [refreshSavedCount]);

  // Handle face capture with auto-fitting
  const handleFaceCaptured = (image: HTMLImageElement, faceBox?: DetectedFaceBox | null) => {
    setCapturedFace(image);
    const box = faceBox || null;
    setDetectedFaceBox(box);

    // Auto-fit face to the avatar's face aperture
    const imgW = image.naturalWidth || image.width || 640;
    const imgH = image.naturalHeight || image.height || 480;
    const autoFit = calculateFaceAutoFit(box, imgW, imgH, selectedAvatar.faceHole);

    setSettings((prev) => ({
      ...prev,
      faceTransform: {
        ...prev.faceTransform,
        scale: autoFit.scale,
        offsetX: autoFit.offsetX,
        offsetY: autoFit.offsetY,
        rotation: 0,
      },
    }));
  };

  // Avatar select - also re-fits face to the new avatar hole if available
  const handleSelectAvatar = (avatar: AvatarItem) => {
    setSelectedAvatar(avatar);
    
    // Auto-fit face to new avatar's aperture dimensions
    if (capturedFace) {
      const imgW = capturedFace.naturalWidth || capturedFace.width || 640;
      const imgH = capturedFace.naturalHeight || capturedFace.height || 480;
      const autoFit = calculateFaceAutoFit(detectedFaceBox, imgW, imgH, avatar.faceHole);

      setSettings((prev) => ({
        ...prev,
        avatarId: avatar.id,
        faceTransform: {
          ...prev.faceTransform,
          scale: autoFit.scale,
          offsetX: autoFit.offsetX,
          offsetY: autoFit.offsetY,
        },
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        avatarId: avatar.id,
      }));
    }
  };

  // Reset All
  const handleResetAll = () => {
    setCapturedFace(null);
    setSelectedAvatar(AVATARS[0]);
    setSettings(INITIAL_SETTINGS);
    setPrintImageUrl('');
    setCurrentStep('camera');
    setShowResetModal(false);
  };

  // Update print sheet
  const handleSetPrintLayout = (mode: PrintLayoutMode, url: string) => {
    setPrintLayout(mode);
    setPrintImageUrl(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      
      {/* Printable Sheet (Hidden on screen, visible exclusively in window.print()) */}
      <PrintSheet
        finalImageUrl={printImageUrl}
        layoutMode={printLayout}
        userName={settings.text.userName}
        avatarTitle={selectedAvatar.name}
      />

      {/* Main Screen App UI (Hidden during window.print()) */}
      <div className="no-print flex-1 flex flex-col">
        {/* Navigation Header */}
        <Header
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          hasCapturedFace={Boolean(capturedFace)}
          onResetAll={() => setShowResetModal(true)}
          onOpenGallery={() => setIsGalleryOpen(true)}
          onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
          savedCount={savedCount}
        />

        {/* Dynamic Step Viewport */}
        <main className="flex-1 pb-16">
          {currentStep === 'camera' && (
            <Step1Camera
              onFaceCaptured={handleFaceCaptured}
              capturedImage={capturedFace}
              onNext={() => setCurrentStep('avatar')}
            />
          )}

          {currentStep === 'avatar' && (
            <Step2AvatarPicker
              selectedAvatarId={selectedAvatar.id}
              onSelectAvatar={handleSelectAvatar}
              onNext={() => setCurrentStep('editor')}
              onBack={() => setCurrentStep('camera')}
            />
          )}

          {currentStep === 'editor' && (
            <Step3Editor
              avatar={selectedAvatar}
              faceImage={capturedFace}
              settings={settings}
              onChangeSettings={setSettings}
              onSelectAvatar={handleSelectAvatar}
              onBackToCamera={() => setCurrentStep('camera')}
              onNext={() => setCurrentStep('export')}
            />
          )}

          {currentStep === 'export' && (
            <Step4DownloadPrint
              avatar={selectedAvatar}
              faceImage={capturedFace}
              settings={settings}
              onBackToEdit={() => setCurrentStep('editor')}
              onCreateNew={() => {
                // User can choose another avatar while preserving their photo or reset
                setCurrentStep('avatar');
              }}
              onSetPrintLayout={handleSetPrintLayout}
              onOpenGallery={() => setIsGalleryOpen(true)}
              onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
              onAvatarSaved={refreshSavedCount}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="no-print bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 text-sm font-heading">
                AvatarKu Studio
              </span>
              <span>— Jom Cipta Avatar Diri Anda!</span>
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="hover:text-indigo-600 font-medium transition-colors cursor-pointer"
              >
                Galeri Maya ({savedCount})
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsSupabaseConfigOpen(true)}
                className="hover:text-emerald-600 font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                Pangkalan Data Supabase
              </button>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                <Shield className="w-3 h-3" /> Privasi Terjamin
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onOpenSupabaseConfig={() => {
          setIsGalleryOpen(false);
          setIsSupabaseConfigOpen(true);
        }}
      />

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        onConfigSaved={() => {
          refreshSavedCount();
        }}
      />

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading mb-2">
              Mula Sesi Baharu?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Tindakan ini akan memadamkan gambar wajah semasa dan mengembalikan tetapan kepada asal.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Ya, Mula Semula
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
