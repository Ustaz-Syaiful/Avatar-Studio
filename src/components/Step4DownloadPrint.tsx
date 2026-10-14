import React, { useState, useEffect, useRef } from 'react';
import { AvatarItem, EditorSettings, PrintLayoutMode } from '../types';
import {
  generate4RCanvas,
  generateA4Canvas,
  renderCompositeAvatar,
} from '../utils/canvasRenderer';
import { playSuccessChime } from '../utils/audio';
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
} from 'lucide-react';

interface Step4DownloadPrintProps {
  avatar: AvatarItem;
  faceImage: HTMLImageElement | null;
  settings: EditorSettings;
  onBackToEdit: () => void;
  onCreateNew: () => void;
  onSetPrintLayout: (mode: PrintLayoutMode, url: string) => void;
}

export const Step4DownloadPrint: React.FC<Step4DownloadPrintProps> = ({
  avatar,
  faceImage,
  settings,
  onBackToEdit,
  onCreateNew,
  onSetPrintLayout,
}) => {
  const [printLayout, setPrintLayout] = useState<PrintLayoutMode>('single_full');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // Download Standard PNG (600x900)
  const handleDownloadStandardPng = () => {
    if (!previewCanvasRef.current) return;
    const cleanName = (settings.text.userName || avatar.name).replace(/\s+/g, '_');
    downloadCanvasAsPng(previewCanvasRef.current, `AvatarKu_${cleanName}_Standard.png`);
  };

  // Download High-Res 4R Photo (1200x1800, 300 DPI)
  const handleDownload4R = async () => {
    setIsGenerating(true);
    try {
      const canvas4R = await generate4RCanvas(avatar, faceImage, settings);
      const cleanName = (settings.text.userName || avatar.name).replace(/\s+/g, '_');
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
      const cleanName = (settings.text.userName || avatar.name).replace(/\s+/g, '_');
      downloadCanvasAsPng(canvasA4, `AvatarKu_${cleanName}_A4_${printLayout}.png`);
    } catch (err) {
      console.error('Error creating A4 sheet:', err);
    } finally {
      setIsGenerating(false);
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
          Karya avatar peribadi anda sedia untuk dimuat turun dalam kualiti tinggi atau dicetak pada saiz foto 4R & kertas A4.
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
          <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/90 border border-slate-100 w-full max-w-md">
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
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ubah Suntingan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Download & Print Options (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section A: Muat Turun Fail Digital (PNG & 4R) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/80 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                Pilihan 1: Muat Turun Imej Digital
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Button A: PNG Kualiti Penuh */}
              <button
                type="button"
                onClick={handleDownloadStandardPng}
                disabled={isGenerating}
                className="p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <FileImage className="w-5 h-5 text-indigo-600" />
                    <span className="text-[10px] font-bold bg-indigo-200/70 text-indigo-800 px-2 py-0.5 rounded-full">
                      Format PNG
                    </span>
                  </div>
                  <strong className="block text-slate-900 font-bold text-sm">
                    Muat Turun PNG
                  </strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Fail imej digital jernih sesuai untuk dikongsi di media sosial atau peranti telefon.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-indigo-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Muat Turun Sekarang</span> →
                </div>
              </button>

              {/* Button B: Foto 4R Kualiti Cetakan 300 DPI */}
              <button
                type="button"
                onClick={handleDownload4R}
                disabled={isGenerating}
                className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      1200 × 1800 px
                    </span>
                  </div>
                  <strong className="block text-slate-900 font-bold text-sm">
                    Muat Turun Saiz 4R (300 DPI)
                  </strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Resolusi tinggi 4 × 6 inci sedia untuk dihantar ke kedai cetak gambar atau album foto.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Jana Saiz 4R</span> →
                </div>
              </button>

            </div>
          </div>

          {/* Section B: Cetakan Terus Kertas A4 & Susun Atur */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-200/80 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  Pilihan 2: Susun Atur & Cetakan Kertas A4
                </h3>
              </div>
            </div>

            {/* Layout Mode Selector Tabs */}
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-600 block mb-2">
                Pilih Susunan Gambar Pada Kertas A4:
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Mode 1: 1 Gambar Penuh */}
                <button
                  type="button"
                  onClick={() => handleLayoutChange('single_full')}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    printLayout === 'single_full'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-10 border border-slate-400 bg-white rounded-xs mb-1.5 flex items-center justify-center p-0.5">
                    <div className="w-6 h-8 bg-indigo-400 rounded-xs" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">1 Gambar Penuh</span>
                  <span className="text-[10px] text-slate-500">Saiz A4 Besar</span>
                </button>

                {/* Mode 2: 2 Salinan 4R */}
                <button
                  type="button"
                  onClick={() => handleLayoutChange('dual_medium')}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    printLayout === 'dual_medium'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-10 border border-slate-400 bg-white rounded-xs mb-1.5 flex flex-col items-center justify-around p-0.5">
                    <div className="w-6 h-3.5 bg-indigo-400 rounded-xs" />
                    <div className="w-6 h-3.5 bg-indigo-400 rounded-xs" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">2 Salinan Sederhana</span>
                  <span className="text-[10px] text-slate-500">Saiz Foto 4R</span>
                </button>

                {/* Mode 3: 4 Keping Stiker */}
                <button
                  type="button"
                  onClick={() => handleLayoutChange('quad_sticker')}
                  className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    printLayout === 'quad_sticker'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-10 border border-slate-400 bg-white rounded-xs mb-1.5 grid grid-cols-2 gap-0.5 p-0.5">
                    <div className="w-3 h-4 bg-indigo-400 rounded-xs" />
                    <div className="w-3 h-4 bg-indigo-400 rounded-xs" />
                    <div className="w-3 h-4 bg-indigo-400 rounded-xs" />
                    <div className="w-3 h-4 bg-indigo-400 rounded-xs" />
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

          {/* Section C: Start New Session */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onCreateNew}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Cipta Avatar Baharu</span>
            </button>

            <span className="text-xs text-slate-400">
              AvatarKu Studio • Pemprosesan Tempatan 100%
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
