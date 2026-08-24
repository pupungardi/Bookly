'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { Book } from '@/types/book';

interface ContinueReadingProps {
  book: Book;
  progress: number;
  onRead: (book: Book) => void;
}

export default function ContinueReading({ book, progress, onRead }: ContinueReadingProps) {
  const hasCover = Boolean(
    book?.cover && 
    typeof book.cover === 'string' && 
    (book.cover.startsWith('http') || book.cover.startsWith('data:') || book.cover.startsWith('/'))
  );

  return (
    <div className="mb-10">
      <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
        <BookOpen size={18} className="text-emerald-600" />
        <span>Continue Reading</span>
      </h2>
      <motion.div 
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onRead(book)}
        className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex gap-4 sm:gap-6 items-center cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all group"
      >
        <div className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-stone-900">
          {hasCover ? (
            <Image 
              src={book.cover} 
              alt={book?.judul || 'Book Cover'} 
              fill
              unoptimized
              sizes="(max-width: 768px) 80px, 96px"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
              referrerPolicy="no-referrer"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-emerald-950 p-2 flex flex-col justify-between text-white select-none">
              <span className="text-[8px] font-bold uppercase text-emerald-400 truncate">
                {book?.genre || 'eBook'}
              </span>
              <p className="text-[10px] font-bold line-clamp-2 leading-tight">
                {book?.judul || book?.title}
              </p>
              <span className="text-[8px] text-stone-400 truncate">{book?.author}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            {book?.genre || 'eBook'}
          </span>
          <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 mb-0.5 truncate group-hover:text-emerald-700 transition-colors">
            {book?.judul || book?.title || 'Untitled Book'}
          </h3>
          <p className="text-stone-500 text-xs mb-3 truncate">by {book?.author || 'Unknown Author'}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap">{Math.round(progress)}% Read</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
