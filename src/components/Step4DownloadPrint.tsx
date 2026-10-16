import React, { useState, useEffect, useRef } from 'react';
import { AvatarItem, EditorSettings, PrintLayoutMode } from '../types';
import {
  generate4RCanvas,
  generateA4Canvas,
  renderCompositeAvatar,
} from '../utils/canvasRenderer';
import { playSuccessChime } from '../utils/audio';
import { saveAvatar, getSupabaseConfig } from '../utils/supabaseService';
import {
  Download,
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  FileImage,
  Layers,
  HelpCircle,
  PlusCircle,
  Info,
  Database,
  Cloud,
  Users,
  Check,
  Send,
  Loader2,
  GraduationCap,
  Share2,
} from 'lucide-react';

interface Step4DownloadPrintProps {
  avatar: AvatarItem;
  faceImage: HTMLImageElement | null;
  settings: EditorSettings;
  onBackToEdit: () => void;
  onCreateNew: () => void;
  onSetPrintLayout: (mode: PrintLayoutMode, url: string) => void;
  onOpenGallery: () => void;
  onOpenSupabaseConfig: () => void;
  onAvatarSaved?: () => void;
}

const CLASS_OPTIONS = [
  '1 Arif',
  '1 Bestari',
  '2 Arif',
  '2 Bestari',
  '3 Cemerlang',
  '3 Dinamik',
  '4 Cemerlang',
  '4 Dinamik',
  '5 Elit',
  '5 Fikir',
  '6 Elit',
  '6 Fikir',
  'Prasekolah',
  'Guru / Staf',
  'Lain-lain',
];

export const Step4DownloadPrint: React.FC<Step4DownloadPrintProps> = ({
  avatar,
  faceImage,
  settings,
  onBackToEdit,
  onCreateNew,
  onSetPrintLayout,
  onOpenGallery,
  onOpenSupabaseConfig,
  onAvatarSaved,
}) => {
  const [printLayout, setPrintLayout] = useState<PrintLayoutMode>('single_full');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Save to Database / Supabase states
  const [studentName, setStudentName] = useState(settings.text.userName || '');
  const [studentClass, setStudentClass] = useState(CLASS_OPTIONS[0]);
  const [customClass, setCustomClass] = useState('');
  const [slogan, setSlogan] = useState(settings.text.sloganText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    success: boolean;
    source: 'supabase' | 'local';
    message: string;
  } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const supabaseConfig = getSupabaseConfig();

  // Initial render of preview & play celebration chime once
  useEffect(() => {
    let active = true;

    const renderPreview = async () => {
      if (!previewCanvasRef.current) return;
      setIsGenerating(true);

      try {
        await renderCompositeAvatar(
          previewCanvasRef.current,
          avatar,
          faceImage,
          settings,
          600,
          900
        );

        if (active && previewCanvasRef.current) {
          const url = previewCanvasRef.current.toDataURL('image/png', 1.0);
          setPreviewDataUrl(url);
          onSetPrintLayout(printLayout, url);
        }
      } catch (err) {
        console.error('Failed to generate preview:', err);
      } finally {
        if (active) setIsGenerating(false);
      }
    };

    renderPreview();
    playSuccessChime();

    return () => {
      active = false;
    };
  }, [avatar, faceImage, settings, onSetPrintLayout, printLayout]);

  // Handle changing print layout
  const handleLayoutChange = (mode: PrintLayoutMode) => {
    setPrintLayout(mode);
    if (previewDataUrl) {
      onSetPrintLayout(mode, previewDataUrl);
    }
  };

  // Trigger browser print
  const handlePrint = () => {
    if (previewDataUrl) {
      onSetPrintLayout(printLayout, previewDataUrl);
    }
    // Small timeout ensures react updates the print sheet layout state
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Helper download canvas as file
  const downloadCanvasAsPng = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // Mobile Web Share
  const handleShareMobile = async () => {
    if (!previewCanvasRef.current) return;
    const cleanName = (studentName || settings.text.userName || avatar.name).replace(/\s+/g, '_');
    const filename = `AvatarKu_${cleanName}.png`;

    try {
      if (navigator.share && navigator.canShare && previewCanvasRef.current.toBlob) {
        previewCanvasRef.current.toBlob(async (blob) => {
          if (!blob) {
            handleDownloadStandardPng();
            return;
          }
          try {
            const file = new File([blob], filename, { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `AvatarKu - ${studentName || avatar.name}`,
                text: `Lihat avatar saya (${avatar.name}) yang dicipta menggunakan AvatarKu Studio! ✨`,
                files: [file],
              });
              setDownloadSuccess('Avatar berjaya dikongsi!');
              setTimeout(() => setDownloadSuccess(null), 3000);
              return;
            }
          } catch {
            // fallback
          }
          handleDownloadStandardPng();
        }, 'image/png', 0.95);
      } else {
        handleDownloadStandardPng();
      }
    } catch {
      handleDownloadStandardPng();
    }
  };

  // Download Standard PNG (600x900)
  const handleDownloadStandardPng = () => {
    if (!previewCanvasRef.current) return;
    const cleanName = (studentName || settings.text.userName || avatar.name).replace(/\s+/g, '_');
    downloadCanvasAsPng(previewCanvasRef.current, `AvatarKu_${cleanName}_Standard.png`);
  };

  // Download High-Res 4R Photo (1200x1800, 300 DPI)
  const handleDownload4R = async () => {
    setIsGenerating(true);
    try {
      const canvas4R = await generate4RCanvas(avatar, faceImage, settings);
      const cleanName = (studentName || settings.text.userName || avatar.name).replace(/\s+/g, '_');
      downloadCanvasAsPng(canvas4R, `AvatarKu_${cleanName}_4R_Cetak.png`);
    } catch (err) {
      console.error('Error creating 4R photo:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Download entire A4 Layout Sheet (1240x1754)
  const handleDownloadA4Sheet = async () => {
    setIsGenerating(true);
    try {
      const canvasA4 = await generateA4Canvas(avatar, faceImage, settings, printLayout);
      const cleanName = (studentName || settings.text.userName || avatar.name).replace(/\s+/g, '_');
      downloadCanvasAsPng(canvasA4, `AvatarKu_${cleanName}_A4_${printLayout}.png`);
    } catch (err) {
      console.error('Error creating A4 sheet:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save to Database / Supabase
  const handleSaveToDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewCanvasRef.current) return;

    setIsSaving(true);
    setSaveResult(null);

    const finalClass = studentClass === 'Lain-lain' ? customClass.trim() : studentClass;
    const finalName = studentName.trim() || 'Murid AvatarKu';
    const imageDataUrl = previewCanvasRef.current.toDataURL('image/png', 0.92);

    try {
      const res = await saveAvatar({
        id: (crypto.randomUUID && crypto.randomUUID()) || `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        created_at: new Date().toISOString(),
        student_name: finalName,
        class_name: finalClass,
        avatar_id: avatar.id,
        avatar_name: avatar.name,
        avatar_category: avatar.category,
        slogan_text: slogan.trim(),
        image_data: imageDataUrl,
        frame_type: settings.frame,
      });

      setSaveResult({
        success: res.success,
        source: res.source,
        message: res.message,
      });

      if (onAvatarSaved) {
        onAvatarSaved();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveResult({
        success: false,
        source: 'local',
        message: `Ralat semasa menyimpan: ${msg}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="no-print max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" /> Tahniah! Selesai
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Avatar Anda Sudah Siap! 🎉
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-1">
          Karya avatar peribadi anda sedia untuk dimuat turun, dicetak, atau disimpan terus ke pangkalan data awan Supabase!
        </p>
      </div>

      {/* Success Download Banner */}
      {downloadSuccess && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm font-semibold shadow-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Fail <strong>{downloadSuccess}</strong> berjaya dimuat turun ke peranti anda!</span>
        </div>
      )}

      {/* Main Grid: Left preview, Right export choices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Result Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl shadow-xl shadow-slate-200/90 border border-slate-100 w-full max-w-xs sm:max-w-md sticky top-20 sm:top-24">
            <div className="relative aspect-2/3 w-full bg-slate-100 rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full object-contain"
              />

              {isGenerating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs font-bold text-indigo-700">Menjana Imej Kualiti Tinggi...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick summary card */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Watak: <strong className="text-slate-800">{avatar.name}</strong>
              </div>
              <button
                type="button"
                onClick={onBackToEdit}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer min-h-[38px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ubah Suntingan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Save, Download & Print Options (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: SIMPAN KE PANGKALAN DATA / SUPABASE (HIGHLIGHTED FEATURE) */}
          <div className="bg-linear-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/20 border border-indigo-700/50 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg font-heading text-white flex items-center gap-2">
                    Simpan ke Pangkalan Data
                    {supabaseConfig.url ? (
                      <span className="text-[10px] bg-emerald-500 text-emerald-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Cloud className="w-3 h-3" /> Supabase
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full">
                        Setempat (Offline)
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Rekodkan avatar murid ke dalam Galeri Maya kelas secara kekal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenSupabaseConfig}
                className="text-xs text-indigo-200 hover:text-white underline font-semibold flex items-center gap-1 cursor-pointer min-h-[38px]"
              >
                Tetapan Supabase
              </button>
            </div>

            {/* Save Form */}
            <form onSubmit={handleSaveToDatabase} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Nama Murid */}
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1">
                    Nama Murid / Pencipta
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Cth: Muhammad Adam"
                    className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20"
                    required
                  />
                </div>

                {/* Kelas */}
                <div>
                  <label className="block text-xs font-bold text-indigo-200 mb-1">
                    Kelas / Kumpulan
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-indigo-950/80 border border-white/20 text-white text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls} className="bg-slate-900 text-white">
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {studentClass === 'Lain-lain' && (
                <div>
                  <input
                    type="text"
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    placeholder="Taip nama kelas/kumpulan anda..."
                    className="w-full px-3.5 py-3 sm:py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                </div>
              )}

              {/* Moto / Slogan */}
              <div>
                <label className="block text-xs font-bold text-indigo-200 mb-1">
                  Moto / Slogan Avatar
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Cth: Saya Hebat & Rajin Belajar!"
                  className="w-full px-3.5 py-3 sm:py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20"
                />
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                disabled={isSaving || isGenerating}
                className="w-full py-3 px-5 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                    <span>Sedang Menyimpan ke Pangkalan Data...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Simpan ke Galeri Maya / Supabase</span>
                  </>
                )}
              </button>
            </form>

            {/* Save Result Notification */}
            {saveResult && (
              <div className="mt-4 p-3.5 rounded-2xl bg-white/10 border border-emerald-400/40 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span className="text-emerald-100 font-semibold">{saveResult.message}</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenGallery}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Buka Galeri Maya</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Muat Turun Fail Digital (PNG & 4R) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/80 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg font-heading text-slate-900">
                  Muat Turun & Kongsi Gambar
                </h3>
                <p className="text-xs text-slate-500">
                  Simpan gambar ke dalam telefon atau kongsi terus
                </p>
              </div>
            </div>

            {/* Mobile / Tablet Quick Share */}
            <div className="mb-3">
              <button
                type="button"
                onClick={handleShareMobile}
                disabled={isGenerating}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white flex items-center justify-between gap-3 shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs sm:text-sm">
                      Kongsi ke WhatsApp / Simpan ke Galeri Telefon
                    </div>
                    <div className="text-[11px] text-emerald-100 line-clamp-1">
                      Kongsi terus karya avatar kepada ibu bapa atau rakan
                    </div>
                  </div>
                </div>
                <span className="inline-flex px-2.5 py-1 bg-white/20 rounded-full text-[11px] font-bold shrink-0">
                  Pantas 📲
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Standard PNG */}
              <button
                type="button"
                onClick={handleDownloadStandardPng}
                disabled={isGenerating}
                className="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3 text-left transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileImage className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    Muat Turun PNG (Kualiti Penuh)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    600 x 900 px • Format lutsinar & tajam
                  </div>
                </div>
              </button>

              {/* Option 2: 4R Photo */}
              <button
                type="button"
                onClick={handleDownload4R}
                disabled={isGenerating}
                className="p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/50 flex items-center gap-3 text-left transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">
                    Saiz Foto 4R (300 DPI)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    1200 x 1800 px • Sedia dicetak di kedai foto
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Susun Atur Cetakan A4 & Cetak Terus */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/80 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg font-heading text-slate-900">
                  Cetak Gambar & Susun Atur A4
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih cara susunan gambar pada sehelai kertas A4
                </p>
              </div>
            </div>

            {/* Layout Mode Selector */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Susun Atur Lembaran:
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* Single Full */}
                <button
                  type="button"
                  onClick={() => handleLayoutChange('single_full')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    printLayout === 'single_full'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="w-10 h-14 bg-white border border-slate-300 rounded-sm flex items-center justify-center p-1 shadow-2xs">
                    <div className="w-full h-full bg-indigo-500 rounded-xs" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">1 Gambar Penuh</span>
                  <span className="text-[10px] text-slate-500">Saiz Poster / Fail</span>
                </button>

                {/* Dual Medium */}
                <button
                  type="button"
                  onClick={() => handleLayoutChange('dual_medium')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    printLayout === 'dual_medium'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="w-10 h-14 bg-white border border-slate-300 rounded-sm flex flex-col justify-around items-center p-1 gap-1 shadow-2xs">
                    <div className="w-full h-5 bg-indigo-500 rounded-xs" />
                    <div className="w-full h-5 bg-indigo-500 rounded-xs" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">2 Salinan Sederhana</span>
                  <span className="text-[10px] text-slate-500">Kongsi Bersama Kawan</span>
                </button>

                {/* Quad Sticker */}
                <button
                  type="button"
                  onClick={() => handleLayoutChange('quad_sticker')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    printLayout === 'quad_sticker'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="w-10 h-14 bg-white border border-slate-300 rounded-sm grid grid-cols-2 gap-1 p-1 shadow-2xs">
                    <div className="w-3.5 h-5 bg-indigo-400 rounded-xs" />
                    <div className="w-3.5 h-5 bg-indigo-400 rounded-xs" />
                    <div className="w-3.5 h-5 bg-indigo-400 rounded-xs" />
                    <div className="w-3.5 h-5 bg-indigo-400 rounded-xs" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">4 Salinan Mini</span>
                  <span className="text-[10px] text-slate-500">Stiker / Lencana</span>
                </button>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
              >
                <Printer className="w-5 h-5 text-amber-300" />
                <span>Cetak Gambar Sekarang</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadA4Sheet}
                disabled={isGenerating}
                className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Muat Turun Lembaran A4</span>
              </button>
            </div>

            {/* Print Setting Guidelines Tip Box */}
            <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Panduan Tetapan Dialog Cetakan Pelayar (Browser):</strong>
                Dalam tetingkap cetakan yang muncul, tetapkan <strong>Saiz Kertas kepada A4</strong>, <strong>Skala kepada "Fit to printable area" (atau 100%)</strong>, dan pastikan pilihan <strong>Warna</strong> diaktifkan untuk hasil yang cantik.
              </div>
            </div>
          </div>

          {/* Section 4: Start New Session & Gallery Shortcut */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Cipta Avatar Baharu</span>
            </button>

            <button
              type="button"
              onClick={onOpenGallery}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs sm:text-sm border border-indigo-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Buka Galeri Maya Kelas</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
