import React, { useState, useEffect, useMemo } from 'react';
import { SavedAvatarRecord } from '../types';
import {
  fetchAllAvatars,
  deleteAvatar,
  syncLocalRecordsToSupabase,
  getSupabaseConfig,
} from '../utils/supabaseService';
import {
  X,
  Sparkles,
  Download,
  Trash2,
  Printer,
  Search,
  Cloud,
  Database,
  RefreshCw,
  ExternalLink,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSupabaseConfig: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  onOpenSupabaseConfig,
}) => {
  const [avatars, setAvatars] = useState<SavedAvatarRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedAvatarForView, setSelectedAvatarForView] = useState<SavedAvatarRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllAvatars();
      setAvatars(res.records);
      setIsOnline(res.isOnline);
    } catch (err) {
      console.error('Failed to load avatars', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setDeleteConfirmId(null);
      setSelectedAvatarForView(null);
      setSyncStatusMsg(null);
    }
  }, [isOpen]);

  // Extract unique classes
  const classList = useMemo(() => {
    const set = new Set<string>();
    avatars.forEach((a) => {
      if (a.class_name && a.class_name.trim()) {
        set.add(a.class_name.trim());
      }
    });
    return Array.from(set).sort();
  }, [avatars]);

  // Filtered avatars
  const filteredAvatars = useMemo(() => {
    return avatars.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.avatar_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.slogan_text && item.slogan_text.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchClass =
        selectedClass === 'all' ||
        (selectedClass === 'none' && !item.class_name) ||
        item.class_name === selectedClass;

      return matchSearch && matchClass;
    });
  }, [avatars, searchQuery, selectedClass]);

  const handleDelete = async (id: string) => {
    await deleteAvatar(id);
    setAvatars((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirmId(null);
    if (selectedAvatarForView?.id === id) {
      setSelectedAvatarForView(null);
    }
  };

  const handleDownload = (record: SavedAvatarRecord) => {
    const link = document.createElement('a');
    link.href = record.image_data;
    link.download = `AvatarKu_${(record.student_name || 'Murid').replace(/\s+/g, '_')}_${record.avatar_name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (record: SavedAvatarRecord) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Avatar: ${record.student_name}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            img { max-height: 80vh; max-width: 90vw; object-fit: contain; border-radius: 12px; }
            h2 { margin-top: 16px; margin-bottom: 4px; font-size: 20px; }
            p { color: #64748b; margin: 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <img src="${record.image_data}" alt="${record.avatar_name}" />
          <h2>${record.student_name}</h2>
          <p>${record.avatar_name} • ${record.class_name || 'AvatarKu Studio'}</p>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    const res = await syncLocalRecordsToSupabase();
    await loadData();
    setIsSyncing(false);
    setSyncStatusMsg(`Segerak selesai: ${res.syncedCount} avatar berjaya dimuat naik ke Supabase!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-indigo-100 overflow-hidden flex flex-col my-3 sm:my-6 max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-heading tracking-tight">
                  Galeri Maya AvatarKu
                </h2>
                <span className="text-xs bg-amber-400 text-amber-950 font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  {avatars.length} Avatar Murid
                </span>
              </div>
              <p className="text-xs text-indigo-100">
                Pangkalan data & arkib avatar murid yang telah dicipta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div
              onClick={onOpenSupabaseConfig}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Klik untuk buka Tetapan Supabase"
            >
              {isOnline ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Awan Supabase Aktif</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Simpanan Setempat</span>
                </>
              )}
              <Settings className="w-3 h-3 opacity-70 ml-1" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama murid, watak, moto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 sm:py-2 rounded-xl border border-slate-200 text-base sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
              />
            </div>

            {/* Filter class */}
            {classList.length > 0 && (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-base sm:text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px]"
              >
                <option value="all">Semua Kelas ({avatars.length})</option>
                {classList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sync / Refresh Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {isOnline && (
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Menyegerak...' : 'Segerakkan ke Awan'}
              </button>
            )}

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Muat semula data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Segar Semula
            </button>
          </div>
        </div>

        {syncStatusMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {syncStatusMsg}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm font-semibold">Sedang memuatkan avatar dari pangkalan data...</p>
            </div>
          ) : filteredAvatars.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 font-heading mb-1">
                {searchQuery || selectedClass !== 'all'
                  ? 'Tiada avatar sepadan dengan carian'
                  : 'Belum ada avatar disimpan'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                {searchQuery || selectedClass !== 'all'
                  ? 'Cuba ubah kata kunci carian atau pilih kelas yang lain.'
                  : 'Cipta avatar anda sekarang, kemudian tekan butang "Simpan ke Galeri Maya" di Langkah 4 untuk menyimpannya ke pangkalan data!'}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Mula Cipta Avatar ✨
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAvatars.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative bg-slate-100 aspect-3/4 overflow-hidden cursor-pointer flex items-center justify-center"
                    onClick={() => setSelectedAvatarForView(item)}
                  >
                    <img
                      src={item.image_data}
                      alt={item.avatar_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay quick view */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2 rounded-xl bg-white/90 text-slate-900 shadow-md">
                        <Eye className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Sync badge */}
                    <div className="absolute top-2 right-2">
                      {item.sync_status === 'synced' ? (
                        <span
                          className="px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs"
                          title="Tersimpan di Awan Supabase"
                        >
                          <Cloud className="w-3 h-3" /> Supabase
                        </span>
                      ) : (
                        <span
                          className="px-2 py-0.5 rounded-full bg-indigo-500/90 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs"
                          title="Tersimpan secara setempat pada peranti ini"
                        >
                          <Database className="w-3 h-3" /> Setempat
                        </span>
                      )}
                    </div>

                    {/* Class badge */}
                    {item.class_name && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black shadow-xs">
                          {item.class_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info card */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {item.student_name}
                      </h4>
                      <p className="text-[11px] font-semibold text-indigo-600 truncate">
                        {item.avatar_name}
                      </p>
                      {item.slogan_text && (
                        <p className="text-[10px] text-slate-500 italic truncate mt-0.5">
                          "{item.slogan_text}"
                        </p>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('ms-MY', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>

                      {/* Card actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Muat Turun PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrint(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Cetak Avatar"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Padam Avatar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AvatarKu Studio Database:</span>
            <span>Semua gambar disimpan selamat untuk kegunaan aktiviti bilik darjah.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Tutup Galeri
          </button>
        </div>

      </div>

      {/* Full Preview Modal */}
      {selectedAvatarForView && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm font-heading">{selectedAvatarForView.student_name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedAvatarForView.avatar_name} {selectedAvatarForView.class_name ? `• ${selectedAvatarForView.class_name}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAvatarForView(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 flex items-center justify-center">
              <img
                src={selectedAvatarForView.image_data}
                alt={selectedAvatarForView.avatar_name}
                className="max-h-[60vh] object-contain rounded-2xl shadow-lg border border-white"
              />
            </div>

            <div className="p-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleDownload(selectedAvatarForView)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <Download className="w-4 h-4" />
                Muat Turun PNG
              </button>
              <button
                type="button"
                onClick={() => handlePrint(selectedAvatarForView)}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
              >
                <Printer className="w-4 h-4" />
                Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">Padam Avatar Ini?</h4>
            <p className="text-xs text-slate-500 mb-5">
              Avatar ini akan dipadamkan daripada simpanan galeri secara kekal.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
