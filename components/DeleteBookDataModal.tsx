'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Download, 
  Bookmark, 
  Clock, 
  MessageSquare, 
  Check, 
  ShieldAlert, 
  Loader2, 
  Info 
} from 'lucide-react';
import { UserState } from '@/types/book';
import { deleteBookData, DeleteBookDataOptions } from '@/lib/auth-storage';

interface DeleteBookDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState?: UserState;
  onSuccess?: (deletedSummary: string) => void;
}

export default function DeleteBookDataModal({
  isOpen,
  onClose,
  userState,
  onSuccess,
}: DeleteBookDataModalProps) {
  const downloadsCount = userState?.downloads?.length || 0;
  const bookmarksCount = userState?.bookmarks?.length || 0;
  const historyCount = Object.keys(userState?.lastRead || {}).length;
  const reviewsCount = Object.keys(userState?.reviews || {}).length;

  const totalItems = downloadsCount + bookmarksCount + historyCount + reviewsCount;

  const [deleteDownloads, setDeleteDownloads] = useState(true);
  const [deleteBookmarks, setDeleteBookmarks] = useState(true);
  const [deleteReadingHistory, setDeleteReadingHistory] = useState(true);
  const [deleteReviews, setDeleteReviews] = useState(false);
  
  const [confirmKeyword, setConfirmKeyword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setDeleteDownloads(downloadsCount > 0);
    setDeleteBookmarks(bookmarksCount > 0);
    setDeleteReadingHistory(historyCount > 0);
    setDeleteReviews(false);
    setConfirmKeyword('');
    setIsDeleting(false);
    setIsSuccess(false);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  // Selected count calculation
  const selectedCount = 
    (deleteDownloads ? downloadsCount : 0) +
    (deleteBookmarks ? bookmarksCount : 0) +
    (deleteReadingHistory ? historyCount : 0) +
    (deleteReviews ? reviewsCount : 0);

  // Determine if full wipe requires keyword
  const isFullWipe = deleteDownloads && deleteBookmarks && deleteReadingHistory;

  const isDeleteDisabled = 
    selectedCount === 0 || 
    isDeleting || 
    (isFullWipe && totalItems > 0 && confirmKeyword.trim().toUpperCase() !== 'HAPUS');

  const handleSelectAll = (checked: boolean) => {
    setDeleteDownloads(checked);
    setDeleteBookmarks(checked);
    setDeleteReadingHistory(checked);
    setDeleteReviews(checked);
  };

  const handleConfirmDelete = async () => {
    if (isDeleteDisabled) return;

    setIsDeleting(true);

    try {
      // Simulate micro-delay for realistic secure processing
      await new Promise((resolve) => setTimeout(resolve, 600));

      const options: DeleteBookDataOptions = {
        deleteDownloads,
        deleteBookmarks,
        deleteReadingHistory,
        deleteReviews,
      };

      const { deletedCounts } = deleteBookData(options);

      const parts: string[] = [];
      if (deletedCounts.downloads > 0) parts.push(`${deletedCounts.downloads} unduhan`);
      if (deletedCounts.bookmarks > 0) parts.push(`${deletedCounts.bookmarks} bookmark`);
      if (deletedCounts.readingHistory > 0) parts.push(`${deletedCounts.readingHistory} riwayat bacaan`);
      if (deletedCounts.reviews > 0) parts.push(`${deletedCounts.reviews} ulasan`);

      const summaryText = parts.length > 0 
        ? `Berhasil menghapus ${parts.join(', ')}.` 
        : 'Data buku berhasil dibersihkan.';

      setIsSuccess(true);
      
      setTimeout(() => {
        setIsDeleting(false);
        setIsSuccess(false);
        if (onSuccess) onSuccess(summaryText);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Failed to delete book data', err);
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? handleModalClose : undefined}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-start justify-between bg-gradient-to-b from-red-50/60 to-white shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-red-100/80 border border-red-200/60 flex items-center justify-center text-red-600 shadow-sm shrink-0">
                  <ShieldAlert size={26} strokeWidth={2} />
                </div>
                <div>
                  <h2 id="delete-dialog-title" className="text-xl font-bold text-stone-900 leading-tight">
                    Hapus Data Buku
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kelola dan bersihkan data penyimpanan lokal buku Anda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleModalClose}
                disabled={isDeleting}
                aria-label="Tutup dialog"
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors disabled:opacity-40"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-5 custom-scrollbar">
              {/* Security Warning Notice */}
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs leading-relaxed">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950 mb-0.5">Tindakan Permanen</span>
                  Data yang dipilih akan dihapus secara permanen dari perangkat ini. Anda tidak dapat memulihkan progres membaca atau file unduhan offline setelah dihapus.
                </div>
              </div>

              {/* Data Items Selection */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Pilih Data yang Akan Dihapus
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(selectedCount !== totalItems)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                  >
                    {selectedCount === totalItems ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Downloads */}
                  <label 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      deleteDownloads 
                        ? 'border-red-200 bg-red-50/40 text-stone-900' 
                        : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${deleteDownloads ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                        <Download size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">Buku Unduhan Offline</div>
                        <div className="text-xs text-stone-500">
                          {downloadsCount > 0 ? `${downloadsCount} buku tersimpan offline` : 'Tidak ada buku unduhan'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deleteDownloads}
                      onChange={(e) => setDeleteDownloads(e.target.checked)}
                      className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                    />
                  </label>

                  {/* Option 2: Bookmarks */}
                  <label 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      deleteBookmarks 
                        ? 'border-red-200 bg-red-50/40 text-stone-900' 
                        : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${deleteBookmarks ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                        <Bookmark size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">Wishlist & Penanda Buku</div>
                        <div className="text-xs text-stone-500">
                          {bookmarksCount > 0 ? `${bookmarksCount} buku ditandai` : 'Tidak ada buku ditandai'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deleteBookmarks}
                      onChange={(e) => setDeleteBookmarks(e.target.checked)}
                      className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                    />
                  </label>

                  {/* Option 3: Reading Progress */}
                  <label 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      deleteReadingHistory 
                        ? 'border-red-200 bg-red-50/40 text-stone-900' 
                        : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${deleteReadingHistory ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                        <Clock size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">Riwayat & Progres Membaca</div>
                        <div className="text-xs text-stone-500">
                          {historyCount > 0 ? `${historyCount} buku dalam riwayat baca` : 'Tidak ada riwayat'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deleteReadingHistory}
                      onChange={(e) => setDeleteReadingHistory(e.target.checked)}
                      className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                    />
                  </label>

                  {/* Option 4: Reviews */}
                  <label 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      deleteReviews 
                        ? 'border-red-200 bg-red-50/40 text-stone-900' 
                        : 'border-stone-200 bg-stone-50/60 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${deleteReviews ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-500'}`}>
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-stone-900">Ulasan & Rating Pribadi</div>
                        <div className="text-xs text-stone-500">
                          {reviewsCount > 0 ? `${reviewsCount} ulasan tersimpan` : 'Tidak ada ulasan'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={deleteReviews}
                      onChange={(e) => setDeleteReviews(e.target.checked)}
                      className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Safety Safeguard: Type confirmation keyword if deleting all */}
              {isFullWipe && totalItems > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-2"
                >
                  <label htmlFor="confirm-keyword-input" className="block text-xs font-bold text-stone-700">
                    Konfirmasi Keamanan: Ketik <span className="text-red-600 font-mono bg-red-50 px-1.5 py-0.5 rounded border border-red-200">HAPUS</span> di bawah ini
                  </label>
                  <input
                    id="confirm-keyword-input"
                    type="text"
                    value={confirmKeyword}
                    onChange={(e) => setConfirmKeyword(e.target.value)}
                    placeholder="Ketik HAPUS untuk mengonfirmasi"
                    className="w-full px-4 py-2.5 bg-white rounded-xl border border-stone-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none text-sm font-medium transition-all text-stone-900"
                  />
                  {confirmKeyword && confirmKeyword.trim().toUpperCase() !== 'HAPUS' && (
                    <p className="text-[11px] text-red-500 font-medium">
                      Kata kunci harus sesuai: &quot;HAPUS&quot;
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Actions with Distinct Hierarchy */}
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-stone-500 text-center sm:text-left">
                {selectedCount > 0 ? (
                  <span>
                    <strong className="text-stone-800">{selectedCount}</strong> data akan dihapus
                  </span>
                ) : (
                  <span className="text-stone-400">Pilih minimal 1 kategori data</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {/* Secondary Neutral Action */}
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={isDeleting}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-sm font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  Batal
                </button>

                {/* Primary Destructive Action */}
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleteDisabled}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    isDeleteDisabled
                      ? 'bg-stone-300 shadow-none cursor-not-allowed text-stone-500'
                      : isSuccess
                      ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-200/80 hover:from-red-700 hover:to-rose-700'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Selesai!</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      <span>Hapus Data</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
