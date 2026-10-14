import React from 'react';
import { PrintLayoutMode } from '../types';

interface PrintSheetProps {
  finalImageUrl: string;
  layoutMode: PrintLayoutMode;
  userName?: string;
  avatarTitle?: string;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  finalImageUrl,
  layoutMode,
  userName,
  avatarTitle,
}) => {
  if (!finalImageUrl) return null;

  return (
    <div className="printable-area hidden print:block bg-white text-slate-900 p-6 min-h-screen">
      {/* School Document Print Header */}
      <div className="text-center pb-4 mb-4 border-b-2 border-slate-300">
        <h1 className="text-2xl font-black tracking-wide text-slate-900 uppercase">
          AvatarKu Studio • Cetakan Rasmi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {userName ? `Nama Murid: ${userName.toUpperCase()} • ` : ''}
          {avatarTitle ? `Watak: ${avatarTitle} • ` : ''}
          Gunting mengikut garisan putus-putus
        </p>
      </div>

      {/* 1. Single Full Page Layout */}
      {layoutMode === 'single_full' && (
        <div className="flex flex-col items-center justify-center my-4">
          <div className="border-2 border-dashed border-slate-400 p-2 rounded-xl">
            <img
              src={finalImageUrl}
              alt="Avatar Cetakan Penuh"
              className="max-h-[820px] w-auto object-contain mx-auto rounded-lg shadow-xs"
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            ✂️ Potong di sepanjang garis putus-putus
          </div>
        </div>
      )}

      {/* 2. Dual Medium 4R Layout */}
      {layoutMode === 'dual_medium' && (
        <div className="grid grid-cols-1 gap-8 my-4 items-center justify-center max-w-xl mx-auto">
          {[1, 2].map((num) => (
            <div key={num} className="border-2 border-dashed border-slate-400 p-3 rounded-xl flex items-center justify-center flex-col">
              <span className="text-[10px] text-slate-400 mb-1 self-start font-semibold">
                Salinan #{num} (Saiz 4R)
              </span>
              <img
                src={finalImageUrl}
                alt={`Salinan ${num}`}
                className="max-h-[380px] w-auto object-contain rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {/* 3. Quad 4-Pack Sticker Badges */}
      {layoutMode === 'quad_sticker' && (
        <div className="grid grid-cols-2 gap-4 my-2 max-w-2xl mx-auto">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className="border-2 border-dashed border-slate-400 p-2 rounded-xl flex flex-col items-center justify-center bg-slate-50/50"
            >
              <span className="text-[9px] text-slate-400 mb-0.5 font-bold">
                Lencana #{num}
              </span>
              <img
                src={finalImageUrl}
                alt={`Lencana ${num}`}
                className="max-h-[340px] w-auto object-contain rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {/* Print Footer */}
      <div className="text-center pt-4 mt-6 border-t border-slate-200 text-[10px] text-slate-400">
        Dijana menggunakan AvatarKu Studio • Sesuai untuk fail peribadi, lencana meja & kenangan murid.
      </div>
    </div>
  );
};
