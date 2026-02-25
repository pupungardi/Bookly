'use client';

import React from 'react';
import Image from 'next/image';
import { X, BookOpen, Bookmark, Download, Calendar, Hash, Tag, Building2, FileText, Languages, Ruler } from 'lucide-react';
import { Book } from '@/types/book';
import { motion } from 'motion/react';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onRead: (book: Book) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isDownloaded: boolean;
  onToggleDownload: (book: Book) => void;
}

export default function BookDetail({
  book,
  onClose,
  onRead,
  isBookmarked,
  onToggleBookmark,
  isDownloaded,
  onToggleDownload,
}: BookDetailProps) {
  const isValid = (field: string, val: any) => {
    if (!val) return false;
    const s = String(val).trim().toLowerCase();
    if (s === '' || s === 'null' || s === 'undefined' || s === 'n/a' || s === 'nan' || s === '-') return false;
    // Check if it's just zeros or dots (e.g., "0", "0.0", "000", ".")
    if (/^[0.]+$/.test(s)) return false;
    
    // Specific rules for certain fields
    if (field === 'year' && s === '2024') return false; // User complained about 2024 appearing incorrectly
    
    return true;
  };

  const hasDetails = isValid('year', book.year) || isValid('isbn', book.isbn) || isValid('publisher', book.publisher) || 
                     isValid('pages', book.pages) || isValid('language', book.language) || isValid('length', book.length) || isValid('width', book.width);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Cover */}
        <div className="md:w-2/5 bg-stone-100 relative min-h-[300px] md:min-h-0">
          <Image
            src={book.cover}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-900 hover:bg-white transition-colors md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right Side: Details */}
        <div className="md:w-3/5 p-6 md:p-12 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 md:mb-4">
                <Tag size={12} />
                {book.category}
              </div>
              <h2 className="font-serif text-2xl md:text-4xl font-bold text-stone-900 leading-tight mb-2">
                {book.title}
              </h2>
              <p className="text-stone-500 text-base md:text-lg italic">by {book.author}</p>
            </div>
            <button
              onClick={onClose}
              className="hidden md:flex p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {hasDetails && (
            <div className="mb-6 md:mb-8">
              <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 mb-3 md:mb-4">Detail Buku</h4>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {isValid('year', book.year) && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-100 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">Published</div>
                      <div className="text-xs md:text-sm font-semibold">{book.year}</div>
                    </div>
                  </div>
                )}
                {isValid('isbn', book.isbn) && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-100 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                      <Hash size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">ISBN</div>
                      <div className="text-xs md:text-sm font-semibold">{book.isbn}</div>
                    </div>
                  </div>
                )}
                {isValid('publisher', book.publisher) && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-100 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">Penerbit</div>
                      <div className="text-xs md:text-sm font-semibold truncate max-w-[120px]">{book.publisher}</div>
                    </div>
                  </div>
                )}
                {isValid('pages', book.pages) && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-100 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">Halaman</div>
                      <div className="text-xs md:text-sm font-semibold">{book.pages}</div>
                    </div>
                  </div>
                )}
                {isValid('language', book.language) && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-100 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                      <Languages size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">Bahasa</div>
                      <div className="text-xs md:text-sm font-semibold">{book.language}</div>
                    </div>
                  </div>
                )}
                {(isValid('length', book.length) || isValid('width', book.width)) && (
                  <div className="flex items-center gap-3 text-stone-600">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-stone-100 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                      <Ruler size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">Dimensi</div>
                      <div className="text-xs md:text-sm font-semibold">
                        {isValid('length', book.length) && isValid('width', book.width) ? `${book.length} x ${book.width} cm` : (book.length || book.width)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6 md:mb-8 flex-1">
            <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 md:mb-3">Deskripsi</h4>
            <p className="text-stone-600 text-sm md:text-base leading-relaxed line-clamp-6 md:line-clamp-none">
              {book.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-auto pt-4 md:pt-6 border-t border-stone-100">
            <button
              onClick={() => onRead(book)}
              className="flex-1 min-w-[140px] bg-emerald-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <BookOpen size={18} />
              Read Now
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleBookmark(book.id)}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                  isBookmarked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'border-stone-200 text-stone-400 hover:bg-stone-50'
                }`}
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => onToggleDownload(book)}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                  isDownloaded
                    ? 'bg-blue-50 border-blue-200 text-blue-600'
                    : 'border-stone-200 text-stone-400 hover:bg-stone-50'
                }`}
              >
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
