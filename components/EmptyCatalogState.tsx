'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, PlusCircle, SearchX, RotateCcw, Sparkles, BookPlus } from 'lucide-react';

interface EmptyCatalogStateProps {
  isSearchOrFiltered: boolean;
  searchQuery?: string;
  genre?: string;
  onClearFilters: () => void;
  onOpenUpload: () => void;
}

export default function EmptyCatalogState({
  isSearchOrFiltered,
  searchQuery,
  genre,
  onClearFilters,
  onOpenUpload,
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
          No books found
        </h3>

        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          {searchQuery ? (
            <>
              No results found for <span className="font-semibold text-stone-700">&quot;{searchQuery}&quot;</span>.
            </>
          ) : genre ? (
            <>
              No books currently available under the <span className="font-semibold text-stone-700">&quot;{genre}&quot;</span> category.
            </>
          ) : (
            'Try adjusting your search criteria or clearing your active filters to view all available titles.'
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-200/50 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Clear Filters</span>
          </button>
          
          <button
            type="button"
            onClick={onOpenUpload}
            className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <PlusCircle size={14} className="text-emerald-600" />
            <span>Upload New eBook</span>
          </button>
        </div>
      </motion.div>
    );
  }

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

      {/* Primary Mandatory Heading */}
      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3 tracking-tight">
        No books available yet
      </h3>

      {/* Contextual Subtitle */}
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-md mb-8">
        The digital library catalog is currently clean and ready. Admin users can upload, publish, and manage eBooks dynamically from the content studio without modifying any code.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenUpload}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <BookPlus size={18} />
          <span>Upload First eBook (Admin)</span>
        </button>
      </div>

      {/* Helpful Guidance */}
      <div className="mt-8 pt-6 border-t border-stone-200/60 w-full flex items-center justify-center gap-6 text-xs text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Supports PDF &amp; Text Formats
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Real-time Catalog Sync
        </span>
      </div>
    </motion.div>
  );
}
