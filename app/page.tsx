'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Book, UserState } from '@/types/book';
import Navbar from '@/components/Navbar';
import BookCard from '@/components/BookCard';
import BookDetail from '@/components/BookDetail';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'motion/react';

const ContinueReading = dynamic(() => import('@/components/ContinueReading'), { ssr: false });
const BookReader = dynamic(() => import('@/components/BookReader'), { ssr: false });
import { BookOpen, SearchX, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { fetchBooks } from '@/lib/api';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'downloads'>('all');
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [apiBooks, setApiBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('');
  const [year, setYear] = useState('');
  const [bookToDownload, setBookToDownload] = useState<Book | null>(null);
  const [offlineSort, setOfflineSort] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'author_asc' | 'author_desc'>('date_desc');
  
  // User State
  const [userState, setUserState] = useState<UserState>({
    bookmarks: [],
    downloads: [],
    lastRead: {},
    fontSize: 18,
  });

  // Handle hydration and load state
  useEffect(() => {
    const saved = localStorage.getItem('bookly_user_state');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Use Promise.resolve().then to make the state update asynchronous
        // and avoid the "cascading renders" lint error while still
        // correctly hydrating the client state.
        Promise.resolve().then(() => setUserState(data));
      } catch (e) {
        console.error('Failed to parse user state', e);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    // Only save if we have a valid state (to avoid overwriting with defaults on first render)
    // Actually, since this effect runs after the first one (if they were separate), 
    // or just whenever userState changes, we need to be careful.
    // But since we only load once, any subsequent change is a user action.
    // To be safe, we can check if we've loaded yet.
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookly_user_state', JSON.stringify(userState));
    }
  }, [userState]);

  // Fetch books from API
  const loadBooks = useCallback(async () => {
    if (activeTab !== 'all') return;
    
    setIsLoading(true);
    const { books, totalPages: total } = await fetchBooks({
      keyword: searchQuery,
      genre: genre,
      sort: sort,
      year: year,
      page: currentPage
    });
    setApiBooks(books);
    setTotalPages(total);
    setIsLoading(false);
  }, [activeTab, searchQuery, genre, sort, year, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 500); // Debounce
    return () => clearTimeout(timer);
  }, [loadBooks]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleGenreChange = (g: string) => {
    setGenre(g);
    setCurrentPage(1);
  };

  const handleSortChange = (s: string) => {
    setSort(s);
    setCurrentPage(1);
  };

  const handleYearChange = (y: string) => {
    setYear(y);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: 'all' | 'bookmarks' | 'downloads') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const displayBooks = useMemo(() => {
    if (activeTab === 'all') return apiBooks;
    
    if (activeTab === 'bookmarks') {
      // For bookmarks, we show what we have in apiBooks or downloads
      const bookmarkedInApi = apiBooks.filter(b => userState.bookmarks.includes(b.id));
      const bookmarkedInDownloads = userState.downloads.filter(b => userState.bookmarks.includes(b.id));
      // Combine and remove duplicates
      const combined = [...bookmarkedInApi, ...bookmarkedInDownloads];
      return Array.from(new Map(combined.map(item => [item.id, item])).values());
    }
    if (activeTab === 'downloads') {
      let sorted = [...userState.downloads];
      switch (offlineSort) {
        case 'title_asc': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
        case 'title_desc': sorted.sort((a, b) => b.title.localeCompare(a.title)); break;
        case 'author_asc': sorted.sort((a, b) => a.author.localeCompare(b.author)); break;
        case 'author_desc': sorted.sort((a, b) => b.author.localeCompare(a.author)); break;
        case 'date_asc': break;
        case 'date_desc': sorted.reverse(); break;
      }
      return sorted;
    }
    return [];
  }, [activeTab, apiBooks, userState.bookmarks, userState.downloads, offlineSort]);

  const toggleBookmark = (id: string) => {
    setUserState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(id)
        ? prev.bookmarks.filter(bid => bid !== id)
        : [...prev.bookmarks, id]
    }));
  };

  const toggleDownload = (book: Book) => {
    const isDownloaded = userState.downloads.some(b => b.id === book.id);
    if (isDownloaded) {
      setUserState(prev => ({
        ...prev,
        downloads: prev.downloads.filter(b => b.id !== book.id)
      }));
    } else {
      setBookToDownload(book);
    }
  };

  const confirmDownload = () => {
    if (!bookToDownload) return;
    setUserState(prev => ({
      ...prev,
      downloads: [...prev.downloads, bookToDownload]
    }));
    setBookToDownload(null);
  };

  const updateFontSize = (size: number) => {
    setUserState(prev => ({ ...prev, fontSize: size }));
  };

  const updateProgress = (bookId: string, progress: number) => {
    setUserState(prev => ({
      ...prev,
      lastRead: { ...prev.lastRead, [bookId]: progress },
      lastReadBookId: bookId
    }));
  };

  const lastReadBook = useMemo(() => {
    if (!userState.lastReadBookId) return null;
    // Find in apiBooks or downloads
    return apiBooks.find(b => b.id === userState.lastReadBookId) || 
           userState.downloads.find(b => b.id === userState.lastReadBookId);
  }, [userState.lastReadBookId, apiBooks, userState.downloads]);

  const lastReadProgress = useMemo(() => {
    if (!userState.lastReadBookId) return 0;
    return userState.lastRead[userState.lastReadBookId] || 0;
  }, [userState.lastReadBookId, userState.lastRead]);

  const genres = ['Drama', 'Fiction', 'Self-Improvement', 'MetroPop', 'Literary', 'Mysteries & Thrillers', 'Science & Nature', 'Poetry', 'Culture', 'Picture Books'];

  return (
    <main className="min-h-screen pb-20">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={handleSearchChange} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Continue Reading Section */}
        {activeTab === 'all' && lastReadBook && !searchQuery && !genre && currentPage === 1 && (
          <ContinueReading 
            book={lastReadBook} 
            progress={lastReadProgress} 
            onRead={setReadingBook} 
          />
        )}

        {/* Filters Bar */}
        {activeTab === 'all' && (
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-stone-500 bg-stone-100 px-4 py-2 rounded-full text-sm font-medium">
              <Filter size={16} />
              <span>Filters</span>
            </div>
            
            <select 
              value={genre} 
              onChange={(e) => handleGenreChange(e.target.value)}
              className="bg-white border border-stone-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Genres</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select 
              value={sort} 
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-white border border-stone-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Sort By</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
            </select>

            <input 
              type="number"
              placeholder="Year"
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-24 bg-white border border-stone-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            />

            {(genre || sort || year) && (
              <button 
                onClick={() => { setGenre(''); setSort(''); setYear(''); setCurrentPage(1); }}
                className="text-xs font-bold text-emerald-600 uppercase tracking-wider hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              {activeTab === 'all' ? 'Featured Books' : activeTab === 'bookmarks' ? 'Your Bookmarks' : 'Offline Library'}
            </h2>
            {activeTab === 'downloads' && (
              <select 
                value={offlineSort} 
                onChange={(e) => setOfflineSort(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-full px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-600"
              >
                <option value="date_desc">Newest Download</option>
                <option value="date_asc">Oldest Download</option>
                <option value="title_asc">Title A-Z</option>
                <option value="title_desc">Title Z-A</option>
                <option value="author_asc">Author A-Z</option>
                <option value="author_desc">Author Z-A</option>
              </select>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isLoading && <Loader2 className="animate-spin text-emerald-600" size={20} />}
            <span className="text-sm text-stone-400 font-medium">{displayBooks.length} books shown</span>
          </div>
        </div>

        {/* Book Grid */}
        <div id="book-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {!isLoading && displayBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isBookmarked={userState.bookmarks.includes(book.id)}
                isDownloaded={userState.downloads.some(b => b.id === book.id)}
                onToggleBookmark={toggleBookmark}
                onToggleDownload={toggleDownload}
                onRead={setReadingBook}
                onShowDetail={setSelectedBook}
              />
            ))}
          </AnimatePresence>
          
          {isLoading && Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-stone-100 rounded-2xl aspect-[2/3] animate-pulse" />
          ))}
        </div>

        {/* Pagination */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button 
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-full border border-stone-200 disabled:opacity-30 hover:bg-stone-50 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-stone-600">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-full border border-stone-200 disabled:opacity-30 hover:bg-stone-50 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && displayBooks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-6">
              <SearchX size={40} />
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No books found</h3>
            <p className="text-stone-500 max-w-xs">
              Try adjusting your search or check your filters to find what you&apos;re looking for.
            </p>
          </motion.div>
        )}
      </div>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetail
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onRead={(book) => {
              setSelectedBook(null);
              setReadingBook(book);
            }}
            isBookmarked={userState.bookmarks.includes(selectedBook.id)}
            onToggleBookmark={toggleBookmark}
            isDownloaded={userState.downloads.some(b => b.id === selectedBook.id)}
            onToggleDownload={toggleDownload}
          />
        )}
      </AnimatePresence>

      {/* Reader Overlay */}
      <AnimatePresence>
        {readingBook && (
          <BookReader
            book={readingBook}
            onClose={() => setReadingBook(null)}
            isBookmarked={userState.bookmarks.includes(readingBook.id)}
            onToggleBookmark={toggleBookmark}
            initialFontSize={userState.fontSize}
            onFontSizeChange={updateFontSize}
            initialProgress={userState.lastRead[readingBook.id] || 0}
            onProgressChange={(prog) => updateProgress(readingBook.id, prog)}
          />
        )}
      </AnimatePresence>
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {bookToDownload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">Download Book?</h3>
              <p className="text-stone-600 mb-8 text-sm leading-relaxed">
                Are you sure you want to download <span className="font-semibold text-stone-900">&quot;{bookToDownload.title}&quot;</span> for offline reading? This will save the book to your device.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setBookToDownload(null)} 
                  className="px-5 py-2.5 rounded-xl text-stone-500 hover:bg-stone-100 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDownload} 
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition-colors shadow-lg shadow-emerald-100 text-sm"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
