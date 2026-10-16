import React from 'react';
import { Step } from '../types';
import {
  Camera,
  Sparkles,
  Sliders,
  Printer,
  RotateCcw,
  Users,
  Database,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  currentStep: Step;
  onSelectStep: (step: Step) => void;
  hasCapturedFace: boolean;
  onResetAll: () => void;
  onOpenGallery: () => void;
  onOpenSupabaseConfig: () => void;
  isSupabaseConnected: boolean;
  savedCount?: number;
}

const STEPS: { id: Step; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'camera', label: '1. Ambil Gambar', shortLabel: '1. Foto', icon: Camera },
  { id: 'avatar', label: '2. Pilih Avatar', shortLabel: '2. Watak', icon: Sparkles },
  { id: 'editor', label: '3. Sunting Gambar', shortLabel: '3. Sunting', icon: Sliders },
  { id: 'export', label: '4. Cetak & Muat Turun', shortLabel: '4. Cetak', icon: Printer },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSelectStep,
  hasCapturedFace,
  onResetAll,
  onOpenGallery,
  onOpenSupabaseConfig,
  isSupabaseConnected,
  savedCount = 0,
}) => {
  const getStepStatus = (stepId: Step) => {
    const stepOrder: Step[] = ['camera', 'avatar', 'editor', 'export'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const thisIndex = stepOrder.indexOf(stepId);

    if (thisIndex === currentIndex) return 'current';
    if (thisIndex < currentIndex || (thisIndex > 0 && hasCapturedFace)) return 'accessible';
    return 'disabled';
  };

  return (
    <header className="no-print bg-white/95 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
                <span className="text-lg sm:text-xl">✨</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                    AvatarKu <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Studio</span>
                  </h1>
                  <span className="inline-flex px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                    Sekolah
                  </span>
                </div>
                <p className="text-[11px] sm:text-sm font-medium text-slate-500">
                  Jom Cipta Avatar Diri Anda!
                </p>
              </div>
            </div>

            {/* Quick Actions on Mobile */}
            <div className="flex items-center gap-1 sm:gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={onOpenGallery}
                className="relative p-2.5 min-w-[42px] min-h-[42px] text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
                title="Buka Galeri Maya Murid"
                aria-label="Galeri Maya"
              >
                <Users className="w-4 h-4" />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="p-2.5 min-w-[42px] min-h-[42px] text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
                title="Tetapan Pangkalan Data Supabase"
                aria-label="Pangkalan Data Supabase"
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onResetAll}
                className="p-2.5 min-w-[42px] min-h-[42px] text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs flex items-center justify-center transition-colors cursor-pointer"
                title="Padam Semua & Mula Semula"
                aria-label="Mula Semula"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Navigation: Responsive with short labels on smartphone */}
          <nav aria-label="Langkah Proses" className="flex items-center justify-center w-full lg:w-auto py-0.5">
            <ol className="flex items-center justify-between w-full sm:w-auto gap-1 sm:gap-2">
              {STEPS.map((step, idx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                const isCurrent = status === 'current';
                const isAccessible = status === 'accessible';

                return (
                  <li key={step.id} className="flex-1 sm:flex-initial flex items-center">
                    {idx > 0 && (
                      <div className={`hidden sm:block w-2 sm:w-4 h-0.5 mx-0.5 transition-colors ${
                        status === 'current' || status === 'accessible' ? 'bg-indigo-400' : 'bg-slate-200'
                      }`} />
                    )}
                    <button
                      type="button"
                      disabled={status === 'disabled'}
                      onClick={() => onSelectStep(step.id)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all min-h-[38px] ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 scale-102 ring-2 ring-indigo-300'
                          : isAccessible
                          ? 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer'
                          : 'bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-amber-300' : ''}`} />
                      <span className="sm:hidden whitespace-nowrap">{step.shortLabel}</span>
                      <span className="hidden sm:inline whitespace-nowrap">{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Right Toolbar: Galeri Maya, Supabase & Reset */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Gallery Button */}
            <button
              type="button"
              onClick={onOpenGallery}
              className="relative px-3 py-1.5 rounded-xl bg-linear-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Galeri Maya</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black">
                {savedCount}
              </span>
            </button>

            {/* Supabase Status Pill & Config */}
            <button
              type="button"
              onClick={onOpenSupabaseConfig}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSupabaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Tetapan Sambungan Supabase & Pangkalan Data"
            >
              {isSupabaseConnected ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Awan Supabase</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tetapan Supabase</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={onResetAll}
              className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Padam Semua & Mula Semula"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
