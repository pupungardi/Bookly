'use client';

import React from 'react';
import Image from 'next/image';
import { Bookmark, Download, BookOpen, Star } from 'lucide-react';
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      onClick={() => onShowDetail(book)}
      className="group cursor-pointer flex flex-col h-full"
    >
      {/* Cover Container */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 bg-stone-100 border border-stone-200/50">
        <Image
          src={
            book?.cover && typeof book.cover === 'string' && book.cover.startsWith('http')
              ? book.cover
              : '/images/placeholder-book.jpg'
          }
          alt={book?.judul || 'Book Cover'}
          fill
          unoptimized
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg=="
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          priority={priority}
        />
        
        {/* Glassmorphism Overlay on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(book);
            }}
            className="bg-white/90 backdrop-blur-md text-stone-900 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500"
          >
            <BookOpen size={18} className="text-emerald-600" />
            Read Now
          </button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(book.id);
            }}
            className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all ${
              isBookmarked 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white/90 text-stone-600 hover:text-emerald-600'
            }`}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDownload(book);
            }}
            className={`p-2.5 rounded-xl backdrop-blur-md shadow-lg transition-all ${
              isDownloaded 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/90 text-stone-600 hover:text-blue-600'
            }`}
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-[0.2em]">
            {book?.category || 'Uncategorized'}
          </span>
        </div>
        <h3 className="font-serif font-bold text-base md:text-lg text-stone-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {book?.judul || 'Untitled Book'}
        </h3>
        {averageRating && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-[1px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={10} 
                  className={star <= Math.round(Number(averageRating)) ? 'text-stone-700' : 'text-stone-200'} 
                  fill={star <= Math.round(Number(averageRating)) ? 'currentColor' : 'none'} 
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-stone-400">{reviews.length}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
