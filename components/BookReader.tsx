'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { 
  X, 
  ArrowLeft,
  Type, 
  Minus, 
  Plus, 
  Bookmark, 
  Maximize2, 
  Minimize2,
  FileText,
  List,
  BookOpen,
  Check,
  AlignLeft,
  AlignJustify,
  Clock,
  Sparkles,
  ExternalLink,
  Download,
  FileCheck
} from 'lucide-react';
import { Book } from '@/types/book';
import { motion, AnimatePresence } from 'motion/react';

// Reading Themes Definitions (Apple Books / Google Play Books Inspired)
export type ReaderThemeId = 'paper' | 'sepia' | 'twilight' | 'midnight' | 'mint';

interface ReaderTheme {
  id: ReaderThemeId;
  name: string;
  bgClass: string;
  bgHex: string;
  textClass: string;
  textMutedClass: string;
  borderClass: string;
  surfaceClass: string;
  accentClass: string;
  accentHex: string;
}

const READER_THEMES: Record<ReaderThemeId, ReaderTheme> = {
  paper: {
    id: 'paper',
    name: 'Paper',
    bgClass: 'bg-[#FAF8F5]',
    bgHex: '#FAF8F5',
    textClass: 'text-[#1C1917]',
    textMutedClass: 'text-[#78716C]',
    borderClass: 'border-[#E7E5E4]',
    surfaceClass: 'bg-white/95',
    accentClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    accentHex: '#059669',
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    bgClass: 'bg-[#F5EEDB]',
    bgHex: '#F5EEDB',
    textClass: 'text-[#3E2E1A]',
    textMutedClass: 'text-[#84725C]',
    borderClass: 'border-[#DACFAF]',
    surfaceClass: 'bg-[#EFE5CE]/95',
    accentClass: 'text-amber-800 bg-amber-100/70 border-amber-300',
    accentHex: '#9A6A32',
  },
  twilight: {
    id: 'twilight',
    name: 'Twilight',
    bgClass: 'bg-[#1E242B]',
    bgHex: '#1E242B',
    textClass: 'text-[#E2E8F0]',
    textMutedClass: 'text-[#94A3B8]',
    borderClass: 'border-[#334155]',
    surfaceClass: 'bg-[#27303A]/95',
    accentClass: 'text-sky-400 bg-sky-950/60 border-sky-800',
    accentHex: '#38BDF8',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    bgClass: 'bg-[#090A0C]',
    bgHex: '#090A0C',
    textClass: 'text-[#F4F4F5]',
    textMutedClass: 'text-[#A1A1AA]',
    borderClass: 'border-[#27272A]',
    surfaceClass: 'bg-[#141519]/95',
    accentClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    accentHex: '#10B981',
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    bgClass: 'bg-[#EEF5F1]',
    bgHex: '#EEF5F1',
    textClass: 'text-[#142D21]',
    textMutedClass: 'text-[#567A68]',
    borderClass: 'border-[#C8DDD0]',
    surfaceClass: 'bg-[#E3EEE7]/95',
    accentClass: 'text-emerald-800 bg-emerald-100/80 border-emerald-300',
    accentHex: '#059669',
  }
};

type FontFamily = 'serif' | 'sans' | 'mono';
type LineHeight = 'compact' | 'normal' | 'spacious';
type PageWidth = 'narrow' | 'normal' | 'wide';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  initialFontSize?: number;
  onFontSizeChange: (size: number) => void;
  initialProgress?: number;
  onProgressChange: (progress: number) => void;
}

export default function BookReader({ 
  book, 
  onClose, 
  isBookmarked, 
  onToggleBookmark,
  initialFontSize = 18,
  onFontSizeChange,
  initialProgress = 0,
  onProgressChange
}: BookReaderProps) {
  // Reading Typography & Appearance State
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [themeId, setThemeId] = useState<ReaderThemeId>('paper');
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [lineHeight, setLineHeight] = useState<LineHeight>('normal');
  const [pageWidth, setPageWidth] = useState<PageWidth>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'justify'>('left');
  
  // Controls Overlay State
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettingsSheet, setShowSettingsSheet] = useState<boolean>(false);
  const [showChaptersDrawer, setShowChaptersDrawer] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Scroll & Progress State
  const [progress, setProgress] = useState(initialProgress);
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSetInitialScroll = useRef(false);

  const currentTheme = READER_THEMES[themeId] || READER_THEMES.paper;
  const isPdf = Boolean(
    book.pdfUrl && 
    (book.pdfUrl.toLowerCase().endsWith('.pdf') || book.pdfUrl.startsWith('blob:') || book.pdfUrl.startsWith('data:application/pdf'))
  );

  // Calculate estimated reading time for text books (~200 words per minute)
  const readingStats = useMemo(() => {
    if (!book.content) return { totalWords: 0, totalMinutes: 1, remainingMinutes: 1 };
    const words = book.content.trim().split(/\s+/).length;
    const totalMinutes = Math.max(1, Math.ceil(words / 200));
    const remainingMinutes = Math.max(1, Math.ceil(totalMinutes * (1 - (progress / 100))));
    return { totalWords: words, totalMinutes, remainingMinutes };
  }, [book.content, progress]);

  // Extract chapters / sections from book content
  const chapters = useMemo(() => {
    if (!book.content) return [];
    const lines = book.content.split('\n');
    const detected: { title: string; lineIndex: number; id: string }[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (/^(BAB|CHAPTER|BAGIAN|ACT|BAGIAN PERTAMA|EPILOG|PROLOG)\b/i.test(trimmed) && trimmed.length < 80) {
        detected.push({
          title: trimmed,
          lineIndex: index,
          id: `chapter-${detected.length + 1}`
        });
      }
    });

    if (detected.length === 0) {
      detected.push({ title: 'Awal Buku', lineIndex: 0, id: 'start' });
    }
    return detected;
  }, [book.content]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettingsSheet) setShowSettingsSheet(false);
        else if (showChaptersDrawer) setShowChaptersDrawer(false);
        else onClose();
      } else if (e.key === 't' || e.key === 'T') {
        setShowSettingsSheet(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettingsSheet, showChaptersDrawer, onClose]);

  // Initial scroll position for text books
  useEffect(() => {
    if (!isPdf && scrollRef.current && !hasSetInitialScroll.current) {
      const totalScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      if (totalScroll > 0) {
        scrollRef.current.scrollTop = (initialProgress / 100) * totalScroll;
        hasSetInitialScroll.current = true;
      }
    }
  }, [isPdf, initialProgress]);

  // Progress update for text books
  const handleTextProgressUpdate = useCallback(() => {
    if (scrollRef.current) {
      const currentScroll = scrollRef.current.scrollTop;
      const totalScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      const currentProgress = totalScroll > 0 ? Math.round((currentScroll / totalScroll) * 100) : 0;
      
      setProgress(currentProgress);
      onProgressChange(currentProgress);
    }
  }, [onProgressChange]);

  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const onScrollThrottled = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(handleTextProgressUpdate, 350);
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(13, Math.min(32, fontSize + delta));
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  // Jump to chapter section
  const jumpToChapter = (lineIndex: number) => {
    setShowChaptersDrawer(false);
    if (scrollRef.current) {
      const allText = book.content || '';
      const lines = allText.split('\n');
      const ratio = lineIndex / Math.max(1, lines.length);
      const targetScroll = (scrollRef.current.scrollHeight - scrollRef.current.clientHeight) * ratio;
      scrollRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  };

  // Font family styles
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif': return 'font-serif tracking-normal';
      case 'sans': return 'font-sans tracking-tight';
      case 'mono': return 'font-mono text-[0.92em] tracking-tight';
      default: return 'font-serif';
    }
  };

  // Line height styles
  const getLineHeightClass = () => {
    switch (lineHeight) {
      case 'compact': return 'leading-relaxed';
      case 'normal': return 'leading-[1.85]';
      case 'spacious': return 'leading-[2.2]';
      default: return 'leading-[1.85]';
    }
  };

  // Page width / margin styles
  const getPageWidthClass = () => {
    switch (pageWidth) {
      case 'narrow': return 'max-w-xl';
      case 'normal': return 'max-w-3xl';
      case 'wide': return 'max-w-4xl';
      default: return 'max-w-3xl';
    }
  };

  // Tap handler to toggle chrome
  const handleContentAreaClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('form') || target.closest('a') || target.closest('.no-toggle')) {
      return;
    }
    setShowControls(prev => !prev);
    if (showSettingsSheet) setShowSettingsSheet(false);
    if (showChaptersDrawer) setShowChaptersDrawer(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed inset-0 z-[100] ${currentTheme.bgClass} flex flex-col select-none transition-colors duration-300 overflow-hidden`}
    >
      {/* 1. Hairline Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-black/5 dark:bg-white/5 pointer-events-none">
        <motion.div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${isPdf ? 100 : progress}%`, 
            backgroundColor: currentTheme.accentHex 
          }} 
        />
      </div>

      {/* 2. Top Navigation Toolbar */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3.5 border-b ${currentTheme.borderClass} ${currentTheme.surfaceClass} backdrop-blur-xl shadow-xs flex items-center justify-between transition-colors duration-300`}
          >
            {/* Left: Back / Close & Book Metadata */}
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textClass} transition-colors active:scale-95 flex items-center gap-1.5 cursor-pointer`}
                aria-label="Kembali"
                title="Tutup Pembaca"
              >
                <ArrowLeft size={19} />
                <span className="hidden sm:inline text-xs font-semibold">Tutup</span>
              </button>

              <div className="h-4 w-[1px] bg-stone-300 dark:bg-stone-700 hidden sm:block" />

              <div className="min-w-0">
                <h2 className={`font-serif font-bold ${currentTheme.textClass} leading-tight truncate text-sm md:text-base`}>
                  {book?.judul || book?.title || 'Untitled Book'}
                </h2>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`truncate ${currentTheme.textMutedClass}`}>
                    {book?.author || book?.genre || 'Bookly'}
                  </span>
                  {isPdf && (
                    <>
                      <span className={currentTheme.textMutedClass}>•</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <FileCheck size={11} /> Dokumen PDF
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {!isPdf && chapters.length > 1 && (
                <button
                  onClick={() => setShowChaptersDrawer(true)}
                  className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textClass} transition-all cursor-pointer`}
                  title="Daftar Bab & Isi"
                  aria-label="Table of Contents"
                >
                  <List size={18} />
                </button>
              )}

              {/* Bookmark Toggle Button */}
              <button
                onClick={() => onToggleBookmark(book.id)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isBookmarked 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : `hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textClass}`
                }`}
                title={isBookmarked ? 'Hapus Bookmark' : 'Tandai Buku Ini'}
                aria-label="Toggle Bookmark"
              >
                <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>

              {/* Fullscreen Immersion Button */}
              <button
                onClick={toggleFullscreen}
                className={`hidden sm:flex p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textClass} transition-all cursor-pointer`}
                title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (F)'}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* 3. Main Reading Canvas */}
      <div 
        ref={scrollRef}
        onScroll={onScrollThrottled}
        onClick={handleContentAreaClick}
        className={`flex-1 overflow-y-auto cursor-default ${
          isPdf 
            ? 'pt-16 pb-4 px-2 sm:px-4 md:px-8 flex flex-col' 
            : 'px-6 sm:px-12 md:px-20 lg:px-28 py-20 md:py-24'
        }`}
      >
        <div className={isPdf ? 'flex-1 w-full flex flex-col' : `${getPageWidthClass()} mx-auto`}>
          
          {/* Cover Display for Text eBooks */}
          {!isPdf && (
            <div className="mb-14 text-center pt-4 sm:pt-8 select-text">
              <div className="relative mx-auto mb-8 flex justify-center">
                <div 
                  className="relative group rounded-2xl p-2 bg-gradient-to-b from-black/5 to-black/15 dark:from-white/5 dark:to-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
                  style={{ transform: `translateY(${Math.min(25, scrollY * 0.1)}px)` }}
                >
                  <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-black/10 dark:border-white/10 bg-stone-200 dark:bg-stone-800">
                    <Image 
                      src={
                        book?.cover && typeof book.cover === 'string' && (book.cover.startsWith('http') || book.cover.startsWith('data:') || book.cover.startsWith('/'))
                          ? book.cover
                          : '/images/placeholder-book.jpg'
                      } 
                      alt={book?.judul || 'Book Cover'} 
                      fill 
                      unoptimized
                      sizes="(max-width: 768px) 200px, 224px"
                      className="object-contain bg-stone-900/5 dark:bg-black" 
                      referrerPolicy="no-referrer"
                      priority
                    />
                  </div>
                  <div className="absolute inset-y-2 left-2 w-3 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none rounded-l-xl" />
                </div>
              </div>

              {/* Book Metadata Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-stone-600 dark:text-stone-300">
                <Sparkles size={13} className="text-emerald-500" />
                <span>{book?.genre || 'E-Book'}</span>
              </div>

              <h1 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold ${currentTheme.textClass} mb-3 tracking-tight leading-tight`}>
                {book?.judul || book?.title || 'Untitled Book'}
              </h1>

              <p className={`text-base sm:text-lg ${currentTheme.textMutedClass} font-medium mb-6`}>
                {book?.author ? `Ditulis oleh ${book.author}` : 'Koleksi Bookly'}
              </p>

              {/* Editorial Info Pill */}
              <div className={`flex flex-wrap items-center justify-center gap-3 text-xs ${currentTheme.textMutedClass} pb-6 border-b ${currentTheme.borderClass} max-w-lg mx-auto`}>
                {book?.year && <span>Tahun {book.year}</span>}
                {book?.publisher && (
                  <>
                    <span>•</span>
                    <span>{book.publisher}</span>
                  </>
                )}
                {book?.pages && (
                  <>
                    <span>•</span>
                    <span>{book.pages} Halaman</span>
                  </>
                )}
                {readingStats.totalMinutes > 0 && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <Clock size={12} /> ~{readingStats.totalMinutes} mnt baca
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Reading Content Area: High-Performance PDF Embed OR Rich Text Reader */}
          {isPdf ? (
            <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[75vh] py-2">
              <div className="w-full max-w-5xl flex-1 h-[78vh] bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
                
                {/* PDF Header Action Bar */}
                <div className="bg-stone-100 dark:bg-stone-800/80 px-4 py-2.5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold truncate">
                    <FileText size={16} className="text-emerald-600" />
                    <span className="truncate">{book.judul || book.title}.pdf</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-700 hover:bg-emerald-50 hover:text-emerald-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      title="Buka PDF di tab baru"
                    >
                      <ExternalLink size={13} />
                      <span className="hidden sm:inline">Tab Baru</span>
                    </a>
                    <a
                      href={book.pdfUrl}
                      download={`${book.judul || book.title || 'ebook'}.pdf`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      title="Unduh file PDF"
                    >
                      <Download size={13} />
                      <span>Unduh</span>
                    </a>
                  </div>
                </div>

                {/* Embedded PDF Viewer */}
                <div className="flex-1 w-full h-full relative bg-stone-100 dark:bg-stone-950">
                  <iframe
                    src={`${book.pdfUrl}#toolbar=1&navpanes=1`}
                    title={book.judul || 'PDF Document'}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Refined Text Typography Area */
            <article 
              className={`${getFontFamilyClass()} ${getLineHeightClass()} ${currentTheme.textClass} text-${textAlign} select-text space-y-6 pb-32`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {book.content ? (
                book.content.split('\n\n').map((paragraph, idx) => {
                  const isHeading = /^(BAB|CHAPTER|BAGIAN|EPILOG|PROLOG)/i.test(paragraph.trim());
                  
                  if (isHeading) {
                    return (
                      <div key={idx} className="pt-10 pb-4 text-center">
                        <div className="w-8 h-[2px] bg-emerald-500/60 mx-auto mb-4 rounded-full" />
                        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                          {paragraph}
                        </h3>
                      </div>
                    );
                  }

                  return (
                    <p key={idx} className="leading-relaxed transition-all">
                      {paragraph}
                    </p>
                  );
                })
              ) : (
                <div className="text-center py-16 text-stone-500 space-y-4">
                  <BookOpen size={36} className="mx-auto text-stone-400 opacity-60" />
                  <p className="italic">Konten teks lengkap untuk buku ini sedang disiapkan.</p>
                  {(book.deskripsi || book.synopsis) && (
                    <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 text-left">
                      <h4 className="font-bold text-xs uppercase mb-1">Sinopsis:</h4>
                      <p className="text-sm opacity-80 leading-relaxed">{book.deskripsi || book.synopsis}</p>
                    </div>
                  )}
                </div>
              )}
            </article>
          )}

        </div>
      </div>

      {/* 4. Bottom Action Dock */}
      <AnimatePresence>
        {showControls && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`fixed bottom-0 left-0 right-0 z-40 px-4 md:px-8 py-3 border-t ${currentTheme.borderClass} ${currentTheme.surfaceClass} backdrop-blur-xl shadow-lg transition-colors duration-300`}
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
              
              {/* Left Dock Item: Table of contents */}
              <div className="flex items-center gap-2">
                {!isPdf && (
                  <button
                    onClick={() => setShowChaptersDrawer(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium border ${currentTheme.borderClass} hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textClass} transition-all active:scale-95 cursor-pointer`}
                    title="Daftar Bab"
                  >
                    <List size={15} />
                    <span className="hidden sm:inline font-semibold">Daftar Isi</span>
                  </button>
                )}
              </div>

              {/* Center Dock Item: Progress & Stats */}
              <div className="flex items-center gap-2">
                {!isPdf ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 font-medium">
                      <span className={`font-bold ${currentTheme.textClass}`}>{progress}% Dibaca</span>
                      {readingStats.remainingMinutes > 0 && (
                        <>
                          <span className={currentTheme.textMutedClass}>•</span>
                          <span className={currentTheme.textMutedClass}>
                            Sisa ~{readingStats.remainingMinutes} mnt
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className={`font-semibold ${currentTheme.textMutedClass}`}>
                    Membaca Dokumen PDF
                  </span>
                )}
              </div>

              {/* Right Dock Item: Reading Settings "Aa" */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSettingsSheet(prev => !prev)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold border transition-all active:scale-95 cursor-pointer ${
                    showSettingsSheet 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                      : `border ${currentTheme.borderClass} hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textClass}`
                  }`}
                  title="Pengaturan Tampilan (T)"
                  aria-label="Reading Settings"
                >
                  <Type size={15} />
                  <span className="text-xs font-serif font-bold">Aa</span>
                </button>
              </div>

            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* 5. Reading Settings Popover Sheet */}
      <AnimatePresence>
        {showSettingsSheet && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-end justify-center sm:justify-end p-4 md:p-6 bg-black/30 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSettingsSheet(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-sm rounded-3xl p-5 md:p-6 shadow-2xl border ${currentTheme.borderClass} ${currentTheme.surfaceClass} backdrop-blur-2xl text-stone-900 dark:text-stone-100 no-toggle`}
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Type size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className={`font-serif font-bold text-base ${currentTheme.textClass}`}>Tampilan & Tipografi</h3>
                </div>
                <button 
                  onClick={() => setShowSettingsSheet(false)}
                  className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textMutedClass} cursor-pointer`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Theme Selector Palette */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className={`block font-semibold uppercase tracking-wider text-[10px] ${currentTheme.textMutedClass} mb-2`}>
                    Tema Membaca
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(READER_THEMES) as ReaderThemeId[]).map((id) => {
                      const t = READER_THEMES[id];
                      const isSelected = themeId === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setThemeId(id)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-sm' 
                              : 'border-black/10 dark:border-white/10 hover:border-black/30'
                          }`}
                          style={{ backgroundColor: t.bgHex }}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: t.bgHex }}>
                            {isSelected && <Check size={12} className={t.id === 'midnight' || t.id === 'twilight' ? 'text-white' : 'text-stone-900'} />}
                          </div>
                          <span className={`text-[10px] font-semibold ${t.id === 'midnight' || t.id === 'twilight' ? 'text-stone-300' : 'text-stone-800'}`}>
                            {t.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!isPdf && (
                  <>
                    {/* Font Size Stepper */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={`font-semibold uppercase tracking-wider text-[10px] ${currentTheme.textMutedClass}`}>
                          Ukuran Teks
                        </label>
                        <span className={`font-bold ${currentTheme.textClass}`}>{fontSize} pt</span>
                      </div>
                      <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
                        <button 
                          onClick={() => adjustFontSize(-2)}
                          className={`p-2 rounded-xl bg-white dark:bg-stone-800 shadow-xs hover:bg-stone-50 ${currentTheme.textClass} transition-all active:scale-95 cursor-pointer`}
                          aria-label="Decrease font size"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="range"
                          min={14}
                          max={30}
                          step={1}
                          value={fontSize}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setFontSize(val);
                            onFontSizeChange(val);
                          }}
                          className="flex-1 h-1.5 bg-black/10 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <button 
                          onClick={() => adjustFontSize(2)}
                          className={`p-2 rounded-xl bg-white dark:bg-stone-800 shadow-xs hover:bg-stone-50 ${currentTheme.textClass} transition-all active:scale-95 cursor-pointer`}
                          aria-label="Increase font size"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Font Family Selector */}
                    <div>
                      <label className={`block font-semibold uppercase tracking-wider text-[10px] ${currentTheme.textMutedClass} mb-2`}>
                        Jenis Font
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'serif', label: 'Serif', sample: 'Georgia' },
                          { id: 'sans', label: 'Sans', sample: 'Modern' },
                          { id: 'mono', label: 'Mono', sample: 'Code' },
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setFontFamily(f.id as FontFamily)}
                            className={`px-3 py-2 rounded-xl border text-center transition-all cursor-pointer ${
                              fontFamily === f.id 
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold' 
                                : `border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 ${currentTheme.textClass}`
                            }`}
                          >
                            <div className="text-xs">{f.label}</div>
                            <div className="text-[10px] opacity-70">{f.sample}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Line Spacing & Alignment */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className={`block font-semibold uppercase tracking-wider text-[10px] ${currentTheme.textMutedClass} mb-2`}>
                          Jarak Baris
                        </label>
                        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
                          {(['compact', 'normal', 'spacious'] as LineHeight[]).map((lh) => (
                            <button
                              key={lh}
                              onClick={() => setLineHeight(lh)}
                              className={`flex-1 py-1 text-[10px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                lineHeight === lh 
                                  ? 'bg-white dark:bg-stone-800 shadow-xs text-emerald-600 dark:text-emerald-400' 
                                  : `${currentTheme.textMutedClass} hover:text-stone-900 dark:hover:text-stone-100`
                              }`}
                            >
                              {lh === 'compact' ? 'Rapat' : lh === 'normal' ? 'Sedang' : 'Lebar'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block font-semibold uppercase tracking-wider text-[10px] ${currentTheme.textMutedClass} mb-2`}>
                          Rata Teks
                        </label>
                        <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
                          <button
                            onClick={() => setTextAlign('left')}
                            className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                              textAlign === 'left' 
                                ? 'bg-white dark:bg-stone-800 shadow-xs text-emerald-600 dark:text-emerald-400' 
                                : currentTheme.textMutedClass
                            }`}
                            title="Rata Kiri"
                          >
                            <AlignLeft size={14} />
                          </button>
                          <button
                            onClick={() => setTextAlign('justify')}
                            className={`flex-1 py-1 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                              textAlign === 'justify' 
                                ? 'bg-white dark:bg-stone-800 shadow-xs text-emerald-600 dark:text-emerald-400' 
                                : currentTheme.textMutedClass
                            }`}
                            title="Rata Kiri Kanan"
                          >
                            <AlignJustify size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Page Margins / Width */}
                    <div>
                      <label className={`block font-semibold uppercase tracking-wider text-[10px] ${currentTheme.textMutedClass} mb-2`}>
                        Lebar Halaman
                      </label>
                      <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/5">
                        {[
                          { id: 'narrow', label: 'Ramping' },
                          { id: 'normal', label: 'Standar' },
                          { id: 'wide', label: 'Lebar' },
                        ].map((w) => (
                          <button
                            key={w.id}
                            onClick={() => setPageWidth(w.id as PageWidth)}
                            className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-all cursor-pointer ${
                              pageWidth === w.id 
                                ? 'bg-white dark:bg-stone-800 shadow-xs text-emerald-600 dark:text-emerald-400' 
                                : currentTheme.textMutedClass
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Chapter Index Drawer (Table of Contents) */}
      <AnimatePresence>
        {showChaptersDrawer && (
          <div 
            className="fixed inset-0 z-50 flex justify-start bg-black/40 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowChaptersDrawer(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-80 max-w-[85vw] h-full ${currentTheme.surfaceClass} backdrop-blur-2xl border-r ${currentTheme.borderClass} shadow-2xl p-6 flex flex-col no-toggle`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className={`font-serif font-bold text-base ${currentTheme.textClass}`}>Daftar Isi</h3>
                </div>
                <button 
                  onClick={() => setShowChaptersDrawer(false)}
                  className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${currentTheme.textMutedClass} cursor-pointer`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => jumpToChapter(chap.lineIndex)}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      idx === 0 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold' 
                        : `hover:bg-black/5 dark:hover:bg-white/5 ${currentTheme.textClass}`
                    }`}
                  >
                    <span className="truncate pr-2">{chap.title}</span>
                  </button>
                ))}
              </div>

              <div className={`pt-4 border-t ${currentTheme.borderClass} text-[11px] ${currentTheme.textMutedClass} flex items-center justify-between`}>
                <span>{chapters.length} Bagian</span>
                <span className="font-semibold text-emerald-600">{progress}% selesai</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
