import React from 'react';
import { Step } from '../types';
import { Camera, Sparkles, Sliders, Printer, ShieldCheck, RotateCcw } from 'lucide-react';

interface HeaderProps {
  currentStep: Step;
  onSelectStep: (step: Step) => void;
  hasCapturedFace: boolean;
  onResetAll: () => void;
}

const STEPS: { id: Step; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'camera', label: '1. Ambil Gambar', icon: Camera },
  { id: 'avatar', label: '2. Pilih Avatar', icon: Sparkles },
  { id: 'editor', label: '3. Sunting Gambar', icon: Sliders },
  { id: 'export', label: '4. Cetak & Muat Turun', icon: Printer },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onSelectStep,
  hasCapturedFace,
  onResetAll,
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
    <header className="no-print bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                    AvatarKu <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">Studio</span>
                  </h1>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                    Edisi Sekolah
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">
                  Jom Cipta Avatar Diri Anda!
                </p>
              </div>
            </div>

            {/* Quick Reset on Mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={onResetAll}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs flex items-center gap-1 transition-colors"
                title="Padam Semua & Mula Semula"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav aria-label="Langkah Proses" className="flex items-center justify-center overflow-x-auto py-1">
            <ol className="flex items-center gap-1 sm:gap-2">
              {STEPS.map((step, idx) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                const isCurrent = status === 'current';
                const isAccessible = status === 'accessible';

                return (
                  <li key={step.id} className="flex items-center">
                    {idx > 0 && (
                      <div className={`w-3 sm:w-6 h-0.5 mx-1 transition-colors ${
                        status === 'current' || status === 'accessible' ? 'bg-indigo-400' : 'bg-slate-200'
                      }`} />
                    )}
                    <button
                      type="button"
                      disabled={status === 'disabled'}
                      onClick={() => onSelectStep(step.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 scale-102 ring-2 ring-indigo-300'
                          : isAccessible
                          ? 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer'
                          : 'bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCurrent ? 'text-amber-300' : ''}`} />
                      <span className="whitespace-nowrap">{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Privacy Badge & Reset Button */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privasi Setempat 100%</span>
            </div>

            <button
              type="button"
              onClick={onResetAll}
              className="px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Padam Semua & Mula Semula"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mula Semula</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
