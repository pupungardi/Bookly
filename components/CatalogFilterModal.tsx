'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  BookOpen,
  ArrowUpDown,
  Calendar,
  Sparkles,
  ArrowDownAZ,
  ArrowUpZA,
  Clock,
  UserCheck,
} from 'lucide-react';

interface CatalogFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  year: string;
  onYearChange: (year: string) => void;
  availableGenres: string[];
  totalResults?: number;
  onReset: () => void;
}

const DEFAULT_GENRES = [
  'Fiksi',
  'Non-Fiksi',
  'Teknologi',
  'Sains',
  'Sejarah',
  'Bisnis',
  'Pengembangan Diri',
  'Filosofi',
  'Psikologi',
  'Novel',
];

const SORT_OPTIONS = [
  { id: '', label: 'Rekomendasi (Bawaan)', desc: 'Urutan katalog standar', icon: Sparkles },
  { id: 'newest', label: 'Terbaru Ditambahkan', desc: 'Buku rilis & unggahan terkini', icon: Clock },
  { id: 'oldest', label: 'Terlama Ditambahkan', desc: 'Koleksi awal perpustakaan', icon: Clock },
  { id: 'title_asc', label: 'Judul (A - Z)', desc: 'Urutan abjad nama buku', icon: ArrowDownAZ },
  { id: 'title_desc', label: 'Judul (Z - A)', desc: 'Urutan abjad terbalik', icon: ArrowUpZA },
  { id: 'author_asc', label: 'Penulis (A - Z)', desc: 'Urutan abjad pengarang', icon: UserCheck },
];

const YEAR_SHORTCUTS = [
  { label: 'Semua', value: '' },
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '2020', value: '2020' },
];

function FilterModalDialog({
  onClose,
  genre,
  onGenreChange,
  sort,
  onSortChange,
  year,
  onYearChange,
  availableGenres,
  onReset,
}: Omit<CatalogFilterModalProps, 'isOpen'>) {
  const [localGenre, setLocalGenre] = useState(genre);
  const [localSort, setLocalSort] = useState(sort);
  const [localYear, setLocalYear] = useState(year);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Combine and deduplicate categories
  const allCategories = useMemo(() => {
    return Array.from(new Set([...availableGenres, ...DEFAULT_GENRES])).filter(Boolean);
  }, [availableGenres]);

  const activeDraftCount = (localGenre ? 1 : 0) + (localSort ? 1 : 0) + (localYear ? 1 : 0);

  const handleApply = () => {
    onGenreChange(localGenre);
    onSortChange(localSort);
    onYearChange(localYear);
    onClose();
  };

  const handleResetDraft = () => {
    setLocalGenre('');
    setLocalSort('');
    setLocalYear('');
  };

  const handleFullReset = () => {
    handleResetDraft();
    onReset();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-stone-900/60 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      {/* Backdrop click dismiss */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 bg-white w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] rounded-t-[2rem] sm:rounded-3xl shadow-2xl border border-stone-200/90 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200/60 shrink-0">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="filter-modal-title" className="text-lg font-serif font-bold text-stone-900">
                  Filter &amp; Urutkan Katalog
                </h2>
                {activeDraftCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
                    {activeDraftCount} Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Sesuaikan kategori, pengurutan, dan tahun untuk menemukan eBook pilihan
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors shrink-0 cursor-pointer"
            aria-label="Tutup panel filter"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* Section 1: Categories / Genre */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={15} className="text-emerald-600" />
                <span>Kategori &amp; Genre Buku</span>
              </label>
              {localGenre && (
                <button
                  type="button"
                  onClick={() => setLocalGenre('')}
                  className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Reset Kategori
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLocalGenre('')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  localGenre === ''
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60'
                }`}
              >
                {localGenre === '' && <Check size={13} className="shrink-0" />}
                <span>Semua Kategori</span>
              </button>

              {allCategories.map((cat) => {
                const isSelected = localGenre === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setLocalGenre(isSelected ? '' : cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                        : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60'
                    }`}
                  >
                    {isSelected && <Check size={13} className="shrink-0" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Sort By */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowUpDown size={15} className="text-blue-600" />
                <span>Urutkan Berdasarkan</span>
              </label>
              {localSort && (
                <button
                  type="button"
                  onClick={() => setLocalSort('')}
                  className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Reset Urutan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = localSort === opt.id;
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setLocalSort(opt.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-stone-800'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {opt.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={2.5} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Publication Year */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={15} className="text-amber-600" />
                <span>Tahun Terbit Buku</span>
              </label>
              {localYear && (
                <button
                  type="button"
                  onClick={() => setLocalYear('')}
                  className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Reset Tahun
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Year Presets */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {YEAR_SHORTCUTS.map((item) => {
                  const isSelected = localYear === item.value;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setLocalYear(item.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200/70'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Year Input */}
              <div className="w-full sm:w-36">
                <input
                  type="number"
                  min="1800"
                  max="2100"
                  placeholder="Input Tahun..."
                  value={localYear}
                  onChange={(e) => setLocalYear(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50/50 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-stone-200/80 bg-stone-50/90 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleFullReset}
            disabled={!localGenre && !localSort && !localYear && !genre && !sort && !year}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
          >
            <RotateCcw size={14} className="shrink-0" />
            <span className="whitespace-nowrap">Reset Semua Filter</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Check size={15} className="shrink-0" />
              <span className="whitespace-nowrap">
                Terapkan Filter {activeDraftCount > 0 ? `(${activeDraftCount})` : ''}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CatalogFilterModal(props: CatalogFilterModalProps) {
  return (
    <AnimatePresence>
      {props.isOpen && (
        <FilterModalDialog
          key="filter-dialog"
          onClose={props.onClose}
          genre={props.genre}
          onGenreChange={props.onGenreChange}
          sort={props.sort}
          onSortChange={props.onSortChange}
          year={props.year}
          onYearChange={props.onYearChange}
          availableGenres={props.availableGenres}
          totalResults={props.totalResults}
          onReset={props.onReset}
        />
      )}
    </AnimatePresence>
  );
}
