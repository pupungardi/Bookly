'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X, Type, Minus, Plus, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '@/types/book';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Page, pdfjs } from 'react-pdf';

// Import styles for react-pdf@7
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker for pdfjs-dist@3
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [progress, setProgress] = useState(initialProgress);
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSetInitialScroll = useRef(false);

  // PDF state
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.0);

  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error('PDF load error:', err);
    setError('Failed to load PDF. Please check your connection or try again later.');
  }

  // Set initial scroll position based on progress
  useEffect(() => {
    if (scrollRef.current && !hasSetInitialScroll.current) {
      const totalScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      if (totalScroll > 0) {
        scrollRef.current.scrollTop = (initialProgress / 100) * totalScroll;
        hasSetInitialScroll.current = true;
      }
    }
  }, [initialProgress]);

  // Debounced progress handler
  const handleProgressUpdate = useCallback(() => {
    if (scrollRef.current) {
      const currentScroll = scrollRef.current.scrollTop;
      const totalScroll = scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      const currentProgress = totalScroll > 0 ? Math.round((currentScroll / totalScroll) * 100) : 0;
      
      setProgress(currentProgress);
      onProgressChange(currentProgress);
    }
  }, [onProgressChange]);

  // Use a local timer for debouncing to avoid excessive parent updates
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const onScrollThrottled = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(handleProgressUpdate, 1000);
  };

  const adjustFontSize = (delta: number) => {
    const newSize = Math.max(12, Math.min(32, fontSize + delta));
    setFontSize(newSize);
    onFontSizeChange(newSize);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-[#fdfcfb] flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X size={24} />
          </button>
          <div>
            <h2 className="font-serif font-bold text-stone-900 leading-none">{book?.judul || 'Untitled Book'}</h2>
            <p className="text-xs text-stone-500 mt-1">{book?.genre || 'Uncategorized'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!book.pdfUrl && (
            <div className="flex items-center bg-stone-100 rounded-full px-2 py-1">
              <button onClick={() => adjustFontSize(-2)} className="p-1.5 hover:bg-white rounded-full transition-all shadow-sm">
                <Minus size={14} />
              </button>
              <div className="px-3 flex items-center gap-1.5 text-stone-600">
                <Type size={14} />
                <span className="text-xs font-bold w-4 text-center">{fontSize}</span>
              </div>
              <button onClick={() => adjustFontSize(2)} className="p-1.5 hover:bg-white rounded-full transition-all shadow-sm">
                <Plus size={14} />
              </button>
            </div>
          )}
          <button
            onClick={() => onToggleBookmark(book.id)}
            className={`p-2 rounded-full transition-all ${
              isBookmarked ? 'bg-emerald-500 text-white' : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div 
        ref={scrollRef}
        onScroll={onScrollThrottled}
        className={`flex-1 overflow-y-auto ${book.pdfUrl ? 'p-0 flex flex-col' : 'px-6 py-12 md:px-24 lg:px-48 xl:px-64'}`}
      >
        <div className={book.pdfUrl ? 'flex-1 w-full' : 'max-w-3xl mx-auto'}>
          {!book.pdfUrl && (
            <div className="mb-12 text-center">
              <div 
                className="relative w-48 h-72 mx-auto mb-8 shadow-2xl rounded-lg overflow-hidden"
                style={{ transform: `translateY(${scrollY * 0.3}px)` }}
              >
                <Image 
                  src={
                    book?.cover && typeof book.cover === 'string' && book.cover.startsWith('http')
                      ? book.cover
                      : '/images/placeholder-book.jpg'
                  } 
                  alt={book?.judul || 'Book Cover'} 
                  fill 
                  unoptimized
                  sizes="192px"
                  className="object-cover" 
                  referrerPolicy="no-referrer"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg=="
                />
              </div>
              <h1 className="font-serif text-4xl font-bold text-stone-900 mb-2 relative z-10">{book?.judul || 'Untitled Book'}</h1>
              <p className="text-stone-500 italic relative z-10">in {book?.genre || 'Uncategorized'}</p>
              <div className="w-12 h-1 bg-emerald-500 mx-auto mt-6 rounded-full relative z-10" />
            </div>
          )}

          {book.pdfUrl ? (
            book.pdfUrl.endsWith('.pdf') ? (
              <div className="w-full h-full flex flex-col items-center bg-stone-100 overflow-y-auto">
                {error ? (
                  <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <Document
                    file={book.pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="flex flex-col items-center py-8"
                    loading={
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={pdfScale}
                      className="shadow-xl"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>
                )}
              </div>
            ) : (
              <div className="w-full h-full">
                <iframe 
                  src={book.pdfUrl} 
                  className="w-full h-full border-none" 
                  title={book.title}
                  allow="fullscreen"
                />
              </div>
            )
          ) : (
            <div 
              className="font-serif leading-relaxed text-stone-800 whitespace-pre-wrap"
              style={{ fontSize: `${fontSize}px` }}
            >
              {book.content}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Progress */}
      {book.pdfUrl && book.pdfUrl.endsWith('.pdf') ? (
        <footer className="px-6 py-4 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-400 font-medium uppercase tracking-widest">
          <span>PDF Viewer</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
              disabled={pageNumber <= 1}
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:hover:text-stone-400"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="flex items-center gap-2">
              <span className="text-stone-600 font-bold">Page {pageNumber}</span>
              <span>of {numPages || '--'}</span>
            </div>
            <button 
              onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
              disabled={pageNumber >= (numPages || 1)}
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:hover:text-stone-400"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-stone-100 rounded">
              <Minus size={14} />
            </button>
            <span>{Math.round(pdfScale * 100)}%</span>
            <button onClick={() => setPdfScale(s => Math.min(3.0, s + 0.1))} className="p-1 hover:bg-stone-100 rounded">
              <Plus size={14} />
            </button>
          </div>
        </footer>
      ) : !book.pdfUrl ? (
        <footer className="px-6 py-4 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-400 font-medium uppercase tracking-widest">
          <span>Chapter 1</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <ChevronLeft size={16} /> Previous
            </button>
            <div className="w-32 h-1 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              Next <ChevronRight size={16} />
            </button>
          </div>
          <span>{progress}% Read</span>
        </footer>
      ) : null}
    </motion.div>
  );
}
