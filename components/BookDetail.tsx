'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, BookOpen, Bookmark, Download, Calendar, Hash, Tag, Building2, FileText, Languages, Ruler, Star, MessageSquare } from 'lucide-react';
import { Book, Review } from '@/types/book';
import { motion } from 'motion/react';
import Description from './Description';

interface BookDetailProps {
  book: Book;
  onClose: () => void;
  onRead: (book: Book) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isDownloaded: boolean;
  onToggleDownload: (book: Book) => void;
  reviews?: Review[];
  onAddReview?: (rating: number, text: string) => void;
}

export default function BookDetail({
  book,
  onClose,
  onRead,
  isBookmarked,
  onToggleBookmark,
  isDownloaded,
  onToggleDownload,
  reviews = [],
  onAddReview,
}: BookDetailProps) {
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewRating === 0) return;
    if (onAddReview) {
      onAddReview(newReviewRating, newReviewText);
      setNewReviewText('');
      setNewReviewRating(0);
    }
  };
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
            src={
              book?.cover && typeof book.cover === 'string' && book.cover.startsWith('http')
                ? book.cover
                : '/images/placeholder-book.jpg'
            }
            alt={book?.judul || 'Book Cover'}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
            referrerPolicy="no-referrer"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg=="
          />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-stone-900 hover:bg-white transition-colors md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Right Side: Details */}
        <div className="md:w-3/5 p-6 md:p-10 lg:p-12 overflow-y-auto flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                  <Tag size={12} />
                  {book?.category || 'Uncategorized'}
                </div>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-stone-900 leading-tight mb-2">
                {book?.judul || 'Untitled Book'}
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-[2px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={14} 
                        className={star <= Math.round(Number(averageRating)) ? 'text-stone-700' : 'text-stone-200'} 
                        fill={star <= Math.round(Number(averageRating)) ? 'currentColor' : 'none'} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-stone-400">{averageRating} • {reviews.length} Ratings</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="hidden md:flex p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col space-y-8">
            {/* Metadata */}
            <div className="space-y-8">
              {hasDetails && (
                <div>
                  <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Detail Buku</h4>
                  <div className="grid grid-cols-1 gap-5">
                    {isValid('year', book.year) && (
                      <div className="flex items-center gap-3 text-stone-600">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
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
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
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
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-stone-400">Penerbit</div>
                          <div className="text-xs md:text-sm font-semibold truncate max-w-[150px]">{book.publisher}</div>
                        </div>
                      </div>
                    )}
                    {isValid('pages', book.pages) && (
                      <div className="flex items-center gap-3 text-stone-600">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
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
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
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
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
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
            </div>

            {/* Description & Reviews */}
            <div className="flex flex-col space-y-8">
              <div>
                <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Deskripsi</h4>
                <div className="flex-1">
                  <Description text={book.deskripsi} />
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
                  <MessageSquare size={14} />
                  Reviews & Ratings
                </h4>
                
                {/* Add Review Form */}
                <form onSubmit={handleSubmitReview} className="mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          size={20} 
                          className={`${(hoverRating || newReviewRating) >= star ? 'text-amber-400' : 'text-stone-300'} transition-colors`}
                          fill={(hoverRating || newReviewRating) >= star ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your thoughts about this book..."
                    className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-20 mb-3"
                  />
                  <button
                    type="submit"
                    disabled={newReviewRating === 0}
                    className="w-full bg-stone-900 text-white py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                  >
                    Post Review
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {reviews.length === 0 ? (
                    <div className="text-center py-6 text-stone-400 text-sm">
                      No reviews yet. Be the first to review!
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-white border border-stone-100 p-4 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm text-stone-900">{review.username}</div>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-bold text-stone-600 ml-1">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">{review.text}</p>
                        <div className="text-[10px] text-stone-400 mt-2 uppercase tracking-wider">
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-10 pt-6 border-t border-stone-100">
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
