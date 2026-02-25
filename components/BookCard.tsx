'use client';

import React from 'react';
import Image from 'next/image';
import { Bookmark, Download, BookOpen } from 'lucide-react';
import { Book } from '@/types/book';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
  isBookmarked: boolean;
  isDownloaded: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleDownload: (book: Book) => void;
  onRead: (book: Book) => void;
  onShowDetail: (book: Book) => void;
}

export default function BookCard({ 
  book, 
  isBookmarked, 
  isDownloaded, 
  onToggleBookmark, 
  onToggleDownload, 
  onRead,
  onShowDetail
}: BookCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={() => onShowDetail(book)}
      className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <button
            onClick={() => onRead(book)}
            className="w-full bg-white text-emerald-700 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-50 transition-colors"
          >
            <BookOpen size={18} />
            Read Now
          </button>
        </div>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(book.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isBookmarked 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white/80 text-stone-600 hover:bg-white'
            }`}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDownload(book);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isDownloaded 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/80 text-stone-600 hover:bg-white'
            }`}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs font-medium text-emerald-600 mb-1 uppercase tracking-wider">{book.category}</div>
        <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-stone-500 line-clamp-1">{book.author}</p>
      </div>
    </motion.div>
  );
}
