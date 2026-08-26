'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, PlusCircle, SearchX, RotateCcw, Sparkles, BookPlus, RefreshCw, LogIn, ShieldCheck } from 'lucide-react';

interface EmptyCatalogStateProps {
  isSearchOrFiltered: boolean;
  searchQuery?: string;
  genre?: string;
  onClearFilters: () => void;
  onOpenUpload: () => void;
  isAdmin?: boolean;
  onRefresh?: () => void;
  onLoginClick?: () => void;
}

export default function EmptyCatalogState({
  isSearchOrFiltered,
  searchQuery,
  genre,
  onClearFilters,
  onOpenUpload,
  isAdmin = false,
  onRefresh,
  onLoginClick,
}: EmptyCatalogStateProps) {
  if (isSearchOrFiltered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="py-16 px-6 max-w-lg mx-auto flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-stone-200/80 shadow-sm"
      >
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-amber-100/80">
          <SearchX size={32} strokeWidth={1.75} />
        </div>

        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
          Buku Tidak Ditemukan
        </h3>

        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          {searchQuery ? (
            <>
              Tidak ditemukan hasil untuk pencarian <span className="font-semibold text-stone-700">&quot;{searchQuery}&quot;</span>.
            </>
          ) : genre ? (
            <>
              Belum ada buku dalam kategori <span className="font-semibold text-stone-700">&quot;{genre}&quot;</span>.
            </>
          ) : (
            'Coba ubah kata kunci pencarian atau setel ulang filter untuk melihat seluruh koleksi yang tersedia.'
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200/50 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Filter &amp; Pencarian</span>
          </button>
          
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <PlusCircle size={14} className="text-emerald-600" />
              <span>Tambah Buku Baru (Admin)</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // If Admin is logged in: Show Admin-specific empty state with quick upload button
  if (isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="py-16 sm:py-20 px-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center bg-gradient-to-b from-stone-50/80 to-white rounded-3xl border border-stone-200/90 shadow-sm"
      >
        {/* Decorative Icon Visual */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <BookOpen size={40} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-md animate-bounce">
            <Sparkles size={14} />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-3">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Panel Administrator Aktif</span>
        </div>

        {/* Heading */}
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
          Katalog Buku Masih Kosong
        </h3>

        {/* Subtitle for Admin */}
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md mb-8">
          Katalog perpustakaan digital saat ini bersih dan siap. Sebagai Administrator, Anda dapat mengunggah file eBook (PDF/Teks) atau mengisi katalog melalui studio admin.
        </p>

        {/* Admin Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenUpload}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <BookPlus size={18} />
            <span>Unggah Buku Pertama (Admin Studio)</span>
          </button>
        </div>

        {/* Guidance */}
        <div className="mt-8 pt-6 border-t border-stone-200/60 w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[11px] sm:text-xs font-semibold text-stone-500">
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span>
            <span className="inline-block whitespace-nowrap font-medium text-stone-600">Format PDF &amp; Teks Didukung</span>
          </div>
          <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-hidden="true"></span>
            <span className="inline-block whitespace-nowrap font-medium text-stone-600">Sinkronisasi Katalog Real-time</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // For Regular Reader (User) or Guest: Clean, Reader-focused Empty State without Admin prompts
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="py-16 sm:py-20 px-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center bg-gradient-to-b from-stone-50/80 to-white rounded-3xl border border-stone-200/90 shadow-sm"
    >
      {/* Decorative Icon Visual */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
          <BookOpen size={40} strokeWidth={1.5} />
        </div>
      </div>

      {/* Heading for Reader */}
      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
        Katalog Buku Sedang Disiapkan
      </h3>

      {/* Subtitle for Reader */}
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md mb-8">
        Koleksi buku digital sedang diperbarui oleh pustakawan. Silakan muat ulang halaman atau periksa kembali dalam beberapa saat untuk menikmati bacaan terbaru.
      </p>

      {/* Action Buttons for Reader */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => {
            if (onRefresh) {
              onRefresh();
            } else if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <RefreshCw size={16} className="shrink-0" />
          <span className="whitespace-nowrap">Muat Ulang Katalog</span>
        </button>

        {onLoginClick && (
          <button
            type="button"
            onClick={onLoginClick}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-stone-100 border border-stone-200 active:scale-95 text-stone-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <LogIn size={16} className="text-stone-500 shrink-0" />
            <span className="whitespace-nowrap">Masuk ke Akun</span>
          </button>
        )}
      </div>

      {/* Guidance footer */}
      <div className="mt-8 pt-6 border-t border-stone-200/60 w-full flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-stone-500">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span>
          <span className="whitespace-nowrap">Perpustakaan Digital Bookly</span>
        </div>
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" aria-hidden="true"></span>
          <span className="whitespace-nowrap">Akses Offline &amp; Bookmark</span>
        </div>
      </div>
    </motion.div>
  );
}
