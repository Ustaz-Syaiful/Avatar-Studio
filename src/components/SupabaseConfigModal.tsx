import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  UploadCloud,
  KeyRound,
  FileCode,
  HelpCircle,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA,
  syncLocalRecordsToSupabase,
} from '../utils/supabaseService';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [tableName, setTableName] = useState('avatar_creations');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    rowCount?: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'sql' | 'guide'>('settings');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url || '');
      setAnonKey(cfg.anonKey || '');
      setTableName(cfg.tableName || 'avatar_creations');
      setTestResult(null);
      setSyncMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url, anonKey, tableName);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      saveSupabaseConfig(url, anonKey, tableName);
      if (onConfigSaved) onConfigSaved();
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleSyncLocal = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    const res = await syncLocalRecordsToSupabase();
    setIsSyncing(false);
    setSyncMessage(
      `Selesai: ${res.syncedCount} avatar berjaya dimuat naik ke Supabase.${
        res.errors > 0 ? ` (${res.errors} ralat)` : ''
      }`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-indigo-100 overflow-hidden flex flex-col my-4 sm:my-8 max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-700 p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
              <Database className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-heading tracking-wide">
                  Pangkalan Data Supabase
                </h2>
                <span className="text-[10px] sm:text-xs bg-emerald-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                  Awan Maya
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                Simpan & kongsikan hasil avatar murid ke pangkalan data awan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 pt-2 gap-1 sm:gap-2 text-xs font-bold text-slate-600 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" />
            Tetapan Sambungan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Skrip SQL (1-Klik)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan Pantas
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-950 mb-1">
                    Ciri Pangkalan Data Supabase Aktif & Sedia Dihubungkan
                  </p>
                  <p className="leading-relaxed">
                    AvatarKu Studio menyokong pangkalan data awan Supabase. Apabila dihubungkan, setiap gambar avatar murid yang disimpan akan direkodkan terus ke jadual awan bersama nama murid, kelas, watak dan cap masa.
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              {testResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-sm mb-0.5">
                      {testResult.success ? 'Sambungan Berjaya!' : 'Ralat Sambungan'}
                    </p>
                    <p className="leading-relaxed">{testResult.message}</p>
                    {testResult.success && testResult.rowCount !== undefined && (
                      <p className="mt-1 font-semibold text-emerald-700">
                        Jumlah rekod avatar semasa dalam pangkalan data: {testResult.rowCount}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Project URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Supabase Project URL</span>
                  <span className="text-[11px] text-slate-400 font-normal">cth: https://abcdefghijklm.supabase.co</span>
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Anon Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Supabase Public / Anon Key</span>
                  <span className="text-[11px] text-slate-400 font-normal">Kunci awam (anon / public) selamat untuk client</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Table Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Jadual (Table Name)
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="avatar_creations"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Lalai: <code className="bg-slate-100 px-1 py-0.5 rounded">avatar_creations</code>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isTesting || !url || !anonKey}
                  className="flex-1 py-3 px-5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sedang Menguji Sambungan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Uji & Simpan Tetapan
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSyncLocal}
                  disabled={isSyncing || !url || !anonKey}
                  className="py-3 px-4 rounded-2xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  title="Muat naik hasil avatar sedia ada dari peranti ini ke Supabase"
                >
                  <UploadCloud className="w-4 h-4" />
                  {isSyncing ? 'Menyegerakkan...' : 'Segerakkan Simpanan Setempat'}
                </button>
              </div>

              {syncMessage && (
                <p className="text-xs text-center font-bold text-indigo-700 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                  {syncMessage}
                </p>
              )}
            </form>
          )}

          {/* TAB 2: SQL SCHEMA SCRIPT */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Skrip SQL Supabase Table & RLS
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hanya perlu dijalankan sekali sahaja di Supabase SQL Editor.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copiedSql
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-white hover:bg-slate-900'
                  }`}
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Disalin ke Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Kod SQL
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-300 leading-relaxed max-h-72 select-all">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Keselamatan & Akses Bebas Murid
                </p>
                <p className="leading-relaxed">
                  Skrip ini telah mengkonfigurasi <strong>Row Level Security (RLS)</strong> supaya murid dan guru boleh menyimpan dan melihat avatar tanpa mewajibkan pendaftaran akaun emel.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  Daftar & Buka Projek Supabase (Percuma)
                </h4>
                <p className="leading-relaxed pl-8">
                  Layari <strong>supabase.com</strong> dan daftar masuk (atau guna akaun GitHub). Klik <em>New Project</em>, pilih nama projek (cth: <code>AvatarKu-Studio</code>) dan tetapkan kata laluan pangkalan data.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    2
                  </span>
                  Jalankan Skrip SQL
                </h4>
                <p className="leading-relaxed pl-8">
                  Di menu sebelah kiri Supabase, klik <strong>SQL Editor</strong> &gt; <strong>New Query</strong>. Buka tab <strong>Skrip SQL (1-Klik)</strong> di atas, salin kod tersebut, tampal ke dalam SQL Editor Supabase dan tekan butang <strong>Run</strong>.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    3
                  </span>
                  Dapatkan URL & Anon Key
                </h4>
                <p className="leading-relaxed pl-8">
                  Klik <strong>Project Settings</strong> (ikon gear) &gt; <strong>API</strong>. Salin <strong>Project URL</strong> dan <strong>anon public key</strong>, kemudian tampal di tab <strong>Tetapan Sambungan</strong> di dalam aplikasi ini!
                </p>
              </div>

              <div className="flex items-center justify-center pt-2">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold underline"
                >
                  Buka Laman Web Supabase <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Simpanan setempat sentiasa aktif walaupun tiada internet</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
