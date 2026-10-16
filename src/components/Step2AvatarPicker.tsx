import React, { useState, useMemo } from 'react';
import { AvatarItem, CategoryId } from '../types';
import { CATEGORIES, AVATARS } from '../data/avatars';
import { Sparkles, ArrowRight, ArrowLeft, Check, User, Users } from 'lucide-react';

interface Step2AvatarPickerProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatar: AvatarItem) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2AvatarPicker: React.FC<Step2AvatarPickerProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  onNext,
  onBack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'lelaki' | 'perempuan'>('all');

  // Filter avatars based on category and gender
  const filteredAvatars = useMemo(() => {
    return AVATARS.filter((avatar) => {
      const matchCat = selectedCategory === 'all' || avatar.category === selectedCategory;
      const matchGender =
        genderFilter === 'all' ||
        avatar.gender === 'unisex' ||
        avatar.gender === genderFilter;
      return matchCat && matchGender;
    });
  }, [selectedCategory, genderFilter]);

  const activeAvatar = AVATARS.find((a) => a.id === selectedAvatarId) || AVATARS[0];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 pb-28 sm:pb-8">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Langkah 2 daripada 4
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Pilih Watak Avatar Impian Anda
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-1">
          Pilih mana-mana watak daripada 12 kategori menarik di bawah. Wajah anda akan digabungkan secara automatik ke dalam avatar ini!
        </p>
      </div>

      {/* Filter Bar: Categories & Genders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-6">
        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300 scale-102'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Gender Quick Toggles */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Jantina Watak:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  genderFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('lelaki')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  genderFilter === 'lelaki' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Lelaki
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('perempuan')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  genderFilter === 'perempuan' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Perempuan
              </button>
            </div>
          </div>

          <div className="text-slate-500 font-medium hidden sm:block">
            Menunjukkan {filteredAvatars.length} watak
          </div>
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {filteredAvatars.map((avatar) => {
          const isSelected = avatar.id === selectedAvatarId;

          return (
            <div
              key={avatar.id}
              onClick={() => onSelectAvatar(avatar)}
              className={`group relative bg-white rounded-3xl p-3 sm:p-4 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 shadow-xl shadow-indigo-200/60 ring-4 ring-indigo-100 scale-102'
                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-200/60'
              }`}
            >
              {/* Selected Check Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md animate-scale-in">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {/* Character Role Pill */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                  {avatar.badgeText}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {avatar.gender === 'lelaki' ? 'Lelaki' : avatar.gender === 'perempuan' ? 'Perempuan' : 'Umum'}
                </span>
              </div>

              {/* Avatar Illustration Preview Container */}
              <div className="relative aspect-3/4 rounded-2xl bg-linear-to-b from-indigo-50/50 to-slate-100 flex items-center justify-center overflow-hidden border border-slate-100 my-1 group-hover:scale-101 transition-transform">
                {/* SVG Visual Render */}
                <svg
                  viewBox="0 0 600 900"
                  className="w-full h-full object-contain pointer-events-none drop-shadow-sm"
                  dangerouslySetInnerHTML={{
                    __html: `
                      <!-- Ruang Muka Oval -->
                      <ellipse cx="${avatar.faceHole.cx}" cy="${avatar.faceHole.cy}" rx="${avatar.faceHole.rx}" ry="${avatar.faceHole.ry}" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="10 6" />
                      <text x="${avatar.faceHole.cx}" y="${avatar.faceHole.cy}" font-size="28" font-family="sans-serif" font-weight="bold" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">Wajah Anda</text>
                      ${avatar.svgForeground}
                    `,
                  }}
                />
              </div>

              {/* Details & Select Button */}
              <div className="mt-3 text-center">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-indigo-600 transition-colors">
                  {avatar.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {avatar.roleTitle}
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAvatar(avatar);
                  }}
                  className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {isSelected ? '✓ Watak Dipilih' : 'Pilih Avatar Ini'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar (Desktop & Tablets) */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Kamera</span>
          </button>

          <div className="hidden sm:block text-xs text-slate-500">
            Watak semasa: <strong className="text-indigo-700">{activeAvatar.name}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-102 active:scale-98 cursor-pointer min-h-[48px]"
        >
          <span>Seterusnya: Sunting & Laraskan Wajah</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Sticky Bottom Bar Exclusively for Mobile Viewports */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl flex items-center justify-between gap-2.5 z-30 sm:hidden">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="truncate">
            <div className="text-[10px] text-slate-400 font-medium">Watak Dipilih:</div>
            <div className="text-xs font-black text-slate-900 truncate">{activeAvatar.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-300 flex items-center gap-1.5 cursor-pointer min-h-[42px]"
          >
            <span>Seterusnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
