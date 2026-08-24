'use client';

import React from 'react';
import Image from 'next/image';
import { Bookmark, Download, BookOpen, Star, Book as BookIcon } from 'lucide-react';
import { Book, Review } from '@/types/book';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
  isBookmarked: boolean;
  isDownloaded: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleDownload: (book: Book) => void;
  onRead: (book: Book) => void;
  onShowDetail: (book: Book) => void;
  priority?: boolean;
  reviews?: Review[];
}

export default function BookCard({ 
  book, 
  isBookmarked, 
  isDownloaded, 
  onToggleBookmark, 
  onToggleDownload, 
  onRead,
  onShowDetail,
  priority = false,
  reviews = []
}: BookCardProps) {
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : null;

  const hasValidCover = Boolean(
    book?.cover && 
    typeof book.cover === 'string' && 
    (book.cover.startsWith('http') || book.cover.startsWith('data:') || book.cover.startsWith('/'))
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      onClick={() => onShowDetail(book)}
      className="group cursor-pointer flex flex-col h-full"
    >
      {/* Cover Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-300 bg-stone-100 border border-stone-200/70">
        {hasValidCover ? (
          <Image
            src={book.cover}
            alt={book?.judul || 'Book Cover'}
            fill
            unoptimized
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
            priority={priority}
          />
        ) : (
          /* Elegant Typographic Fallback Cover */
          <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-emerald-950 p-4 flex flex-col justify-between text-white select-none">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {book?.genre || book?.category || 'eBook'}
              </span>
              <BookIcon size={14} className="text-stone-400" />
            </div>

            <div className="my-auto py-2">
              <h4 className="font-serif font-bold text-sm sm:text-base leading-tight line-clamp-3 text-stone-100">
                {book?.judul || book?.title}
              </h4>
              <p className="text-[11px] text-stone-300 line-clamp-1 mt-1 font-medium">
                {book?.author}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
              <span>{book?.year || 'Bookly'}</span>
              <span>{book?.pages ? `${book.pages} p.` : 'Digital'}</span>
            </div>
          </div>
        )}
        
        {/* Glassmorphism Overlay on Hover */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center p-3 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRead(book);
            }}
            className="bg-white/95 backdrop-blur-md text-stone-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer active:scale-95"
          >
            <BookOpen size={15} className="text-emerald-600" />
            <span>Read Now</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-250 transform translate-x-1 group-hover:translate-x-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(book.id);
            }}
            aria-label="Bookmark eBook"
            className={`p-2 rounded-xl backdrop-blur-md shadow-md transition-all cursor-pointer ${
              isBookmarked 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white/90 text-stone-700 hover:text-emerald-600'
            }`}
          >
            <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDownload(book);
            }}
            aria-label="Download for offline reading"
            className={`p-2 rounded-xl backdrop-blur-md shadow-md transition-all cursor-pointer ${
              isDownloaded 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/90 text-stone-700 hover:text-blue-600'
            }`}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-2.5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-[0.15em] truncate">
            {book?.category || book?.genre || 'eBook'}
          </span>
        </div>
        <h3 className="font-serif font-bold text-sm md:text-base text-stone-900 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {book?.judul || book?.title || 'Untitled Book'}
        </h3>
        <p className="text-xs text-stone-500 truncate mt-0.5 font-medium">
          {book?.author || 'Unknown Author'}
        </p>
        {averageRating && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-[1px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={10} 
                  className={star <= Math.round(Number(averageRating)) ? 'text-amber-500 fill-amber-500' : 'text-stone-200'} 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-stone-600">{averageRating}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
