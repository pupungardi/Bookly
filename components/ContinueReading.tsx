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
  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-stone-900 mb-6 flex items-center gap-2">
        <BookOpen size={20} className="text-emerald-600" />
        Continue Reading
      </h2>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onRead(book)}
        className="bg-white border border-stone-200 rounded-3xl p-3 md:p-4 flex gap-4 md:gap-6 items-center cursor-pointer hover:shadow-xl transition-all group"
      >
        <div className="relative w-20 h-28 md:w-24 md:h-36 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
          <Image 
            src={
              book?.cover && typeof book.cover === 'string' && book.cover.startsWith('http')
                ? book.cover
                : '/images/placeholder-book.jpg'
            } 
            alt={book?.judul || 'Book Cover'} 
            fill
            unoptimized
            sizes="(max-width: 768px) 80px, 96px"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
            referrerPolicy="no-referrer"
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg=="
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg md:text-xl font-bold text-stone-900 mb-0.5 md:mb-1 truncate">{book?.judul || 'Untitled Book'}</h3>
          <p className="text-stone-500 text-xs md:text-sm mb-3 md:mb-4 truncate">in {book?.genre || 'Uncategorized'}</p>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider whitespace-nowrap">{progress}% Read</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
