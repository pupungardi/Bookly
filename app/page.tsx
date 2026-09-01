'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Book, UserState } from '@/types/book';
import Navbar from '@/components/Navbar';
import BookCard from '@/components/BookCard';
import BookDetail from '@/components/BookDetail';
import ContinueReading from '@/components/ContinueReading';
import BookReader from '@/components/BookReader';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Heart, 
  Download, 
  SearchX, 
  Filter, 
  SlidersHorizontal,
  X,
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Search,
  Database,
  PlusCircle,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { fetchBooks } from '@/lib/api';
import { NavBar } from '@/components/ui/tubelight-navbar';
import ProfileModal from '@/components/ProfileModal';
import Toast from '@/components/ui/Toast';
import EmptyCatalogState from '@/components/EmptyCatalogState';
import AdminBookManagementModal from '@/components/AdminBookManagementModal';
import CatalogFilterModal from '@/components/CatalogFilterModal';
import PlatformFeatureBadges from '@/components/PlatformFeatureBadges';
import { getStoredUserState, loginUserAccount, logoutUserAccount } from '@/lib/auth-storage';
import { isAdmin } from '@/lib/rbac';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'downloads' | 'search'>('all');
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [apiBooks, setApiBooks] = useState<Book[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('');
  const [year, setYear] = useState('');
  const [bookToDownload, setBookToDownload] = useState<Book | null>(null);
  const [offlineSort, setOfflineSort] = useState<'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'author_asc' | 'author_desc'>('date_desc');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };
  
  // User State
  const [userState, setUserState] = useState<UserState>({
    bookmarks: [],
    downloads: [],
    lastRead: {},
    fontSize: 18,
    reviews: {},
  });

  const navItems = [
    { name: 'All Books', id: 'all', icon: BookOpen },
    { name: 'Search', id: 'search', icon: Search },
  ];

  // Handle hydration and load state + listen to external state sync
  useEffect(() => {
    const handleSync = () => {
      const state = getStoredUserState();
      setUserState(state);
    };

    handleSync();

    // Check for access denied redirect
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('access_denied') === 'admin') {
          showToast('Akses Ditolak (403): Hak akses Administrator diperlukan untuk membuka panel Admin.', 'error');
          // Clean URL parameter without reloading
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    }, 100);

    window.addEventListener('bookly_user_state_changed', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('bookly_user_state_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Save state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bookly_user_state', JSON.stringify(userState));
    }
  }, [userState]);

  // Fetch dynamic books from API
  const loadBooks = useCallback(async () => {
    if (activeTab !== 'all' && activeTab !== 'search') return;
    
    setIsLoading(true);
    try {
      const { books, totalPages: total, totalCatalogCount: count, availableGenres: genres } = await fetchBooks({
        page: currentPage,
        keyword: searchQuery,
        genre: genre,
        sort: sort,
        year: year,
      });

      setApiBooks(books);
      setTotalPages(total);
      setTotalCatalogCount(count);
      setAvailableGenres(genres || []);
    } catch (e) {
      console.error('Failed to load books:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery, genre, sort, year, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 300); // Debounce
    return () => clearTimeout(timer);
  }, [loadBooks]);

  // Listen to catalog updates from Admin CMS
  useEffect(() => {
    const handleCatalogUpdate = () => {
      loadBooks();
    };

    window.addEventListener('bookly_catalog_updated', handleCatalogUpdate);
    return () => window.removeEventListener('bookly_catalog_updated', handleCatalogUpdate);
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

  const clearFilters = () => {
    setSearchQuery('');
    setGenre('');
    setSort('');
    setYear('');
    setCurrentPage(1);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'profile') {
      setIsProfileOpen(true);
      return;
    }
    setActiveTab(tab as any);
    setCurrentPage(1);
  };

  const displayBooks = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'search') return apiBooks;
    
    if (activeTab === 'bookmarks') {
      const bookmarkedInApi = apiBooks.filter(b => userState.bookmarks.includes(b.id));
      const bookmarkedInDownloads = userState.downloads.filter(b => userState.bookmarks.includes(b.id));
      const combined = [...bookmarkedInApi, ...bookmarkedInDownloads];
      return Array.from(new Map(combined.map(item => [item.id, item])).values());
    }
    if (activeTab === 'downloads') {
      let sorted = [...(userState.downloads || [])];
      switch (offlineSort) {
        case 'title_asc': sorted.sort((a, b) => (a?.judul || a?.title || '').localeCompare(b?.judul || b?.title || '')); break;
        case 'title_desc': sorted.sort((a, b) => (b?.judul || b?.title || '').localeCompare(a?.judul || a?.title || '')); break;
        case 'author_asc': sorted.sort((a, b) => (a?.author || '').localeCompare(b?.author || '')); break;
        case 'author_desc': sorted.sort((a, b) => (b?.author || '').localeCompare(a?.author || '')); break;
        case 'date_asc': break;
        case 'date_desc': sorted.reverse(); break;
      }
      return sorted;
    }
    return [];
  }, [activeTab, apiBooks, userState.bookmarks, userState.downloads, offlineSort]);

  const toggleBookmark = (id: string) => {
    const willBookmark = !userState.bookmarks.includes(id);
    setUserState(prev => ({
      ...prev,
      bookmarks: willBookmark
        ? [...prev.bookmarks, id]
        : prev.bookmarks.filter(bid => bid !== id)
    }));
    showToast(willBookmark ? 'Added to your Wishlist.' : 'Removed from your Wishlist.', 'info');
  };

  const toggleDownload = (book: Book) => {
    const isDownloaded = userState.downloads.some(b => b.id === book.id);
    if (isDownloaded) {
      setUserState(prev => ({
        ...prev,
        downloads: prev.downloads.filter(b => b.id !== book.id)
      }));
      showToast(`"${book.judul || book.title}" removed from Offline Library.`, 'info');
    } else {
      setBookToDownload(book);
    }
  };

  const addReview = (bookId: string, rating: number, text: string) => {
    setUserState(prev => {
      const currentReviews = prev.reviews?.[bookId] || [];
      const newReview = {
        id: Math.random().toString(36).substring(2, 9),
        rating,
        text,
        date: new Date().toISOString(),
        username: prev.username || 'Anonymous User',
      };
      return {
        ...prev,
        reviews: {
          ...prev.reviews,
          [bookId]: [newReview, ...currentReviews],
        }
      };
    });
    showToast('Review submitted successfully!', 'success');
  };

  const confirmDownload = () => {
    if (!bookToDownload) return;
    setUserState(prev => ({
      ...prev,
      downloads: [...prev.downloads, bookToDownload]
    }));
    showToast(`"${bookToDownload.judul || bookToDownload.title}" saved for offline reading!`, 'success');
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
    return apiBooks.find(b => b.id === userState.lastReadBookId) || 
           userState.downloads.find(b => b.id === userState.lastReadBookId);
  }, [userState.lastReadBookId, apiBooks, userState.downloads]);

  const lastReadProgress = useMemo(() => {
    if (!userState.lastReadBookId) return 0;
    return userState.lastRead[userState.lastReadBookId] || 0;
  }, [userState.lastReadBookId, userState.lastRead]);

  const isSearchOrFiltered = Boolean(searchQuery.trim() || genre || year || sort);
  const activeFilterCount = (genre ? 1 : 0) + (sort ? 1 : 0) + (year ? 1 : 0);

  const getSortLabel = (s: string) => {
    switch (s) {
      case 'newest': return 'Terbaru';
      case 'oldest': return 'Terlama';
      case 'title_asc': return 'Judul (A-Z)';
      case 'title_desc': return 'Judul (Z-A)';
      case 'author_asc': return 'Penulis (A-Z)';
      default: return 'Urutan';
    }
  };

  return (
    <main className="min-h-screen pb-24 bg-[#FAFAF9] text-stone-900">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onProfileClick={() => setIsProfileOpen(true)}
        onAdminClick={() => {
          if (isAdmin(userState)) {
            setIsAdminModalOpen(true);
          } else {
            showToast('Akses Ditolak (403): Anda memerlukan izin Administrator.', 'error');
            setIsProfileOpen(true);
          }
        }}
        catalogCount={totalCatalogCount}
        isAdmin={isAdmin(userState)}
        userRole={userState.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search View Bar */}
        {activeTab === 'search' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              autoFocus
              placeholder="Search by title, author, genre, or keyword..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-base text-stone-800 placeholder:text-stone-400"
            />
          </motion.div>
        )}

        {/* Continue Reading Section (Only when active progress exists) */}
        {activeTab === 'all' && lastReadBook && !searchQuery && !genre && currentPage === 1 && (
          <ContinueReading 
            book={lastReadBook} 
            progress={lastReadProgress} 
            onRead={setReadingBook} 
          />
        )}

        {/* Filters Bar for Active Catalog */}
        {activeTab === 'all' && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Unified Single Filter Button */}
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 whitespace-nowrap shrink-0 ${
                  activeFilterCount > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/80'
                    : 'bg-stone-50 hover:bg-stone-100/90 text-stone-700 border border-stone-200/90'
                }`}
                aria-label="Buka filter dan pengurutan katalog"
                aria-expanded={isFilterModalOpen}
              >
                <SlidersHorizontal size={14} className={`shrink-0 ${activeFilterCount > 0 ? 'text-white' : 'text-emerald-600'}`} />
                <span className="whitespace-nowrap">Filter &amp; Urutkan</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-white text-emerald-800 shadow-xs shrink-0">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active Filter Indicators */}
              {genre && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0">
                  <span className="whitespace-nowrap">Kategori: {genre}</span>
                  <button 
                    type="button" 
                    onClick={() => handleGenreChange('')} 
                    className="hover:text-emerald-950 hover:bg-emerald-200/60 rounded-md p-0.5 transition-colors cursor-pointer shrink-0"
                    aria-label={`Hapus filter kategori ${genre}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {sort && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200/80 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0">
                  <span className="whitespace-nowrap">Urutan: {getSortLabel(sort)}</span>
                  <button 
                    type="button" 
                    onClick={() => handleSortChange('')} 
                    className="hover:text-blue-950 hover:bg-blue-200/60 rounded-md p-0.5 transition-colors cursor-pointer shrink-0"
                    aria-label="Hapus filter urutan"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {year && (
                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0">
                  <span className="whitespace-nowrap">Tahun: {year}</span>
                  <button 
                    type="button" 
                    onClick={() => handleYearChange('')} 
                    className="hover:text-amber-950 hover:bg-amber-200/60 rounded-md p-0.5 transition-colors cursor-pointer shrink-0"
                    aria-label="Hapus filter tahun"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {isSearchOrFiltered && (
                <button 
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-stone-500 hover:text-red-600 flex items-center gap-1 hover:underline cursor-pointer px-1 py-1 transition-colors whitespace-nowrap shrink-0"
                  aria-label="Reset semua filter dan pencarian"
                >
                  <RotateCcw size={12} className="shrink-0" />
                  <span className="whitespace-nowrap">Reset Semua</span>
                </button>
              )}
            </div>

            {/* Quick Upload CTA button - Only for Administrator */}
            {isAdmin(userState) && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <PlusCircle size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Add eBook</span>
              </button>
            )}
          </div>
        )}

        {/* Section Title Header & Features */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight whitespace-nowrap">
              {activeTab === 'all' 
                ? (genre ? `${genre} eBooks` : 'Explore Catalog')
                : activeTab === 'bookmarks' 
                  ? 'Your Wishlist' 
                  : activeTab === 'downloads'
                    ? 'Offline Library'
                    : 'Search Results'}
            </h2>

            {activeTab === 'all' && (
              <div className="hidden lg:flex items-center ml-2">
                <PlatformFeatureBadges variant="pill" />
              </div>
            )}

            {activeTab === 'downloads' && (
              <select 
                value={offlineSort} 
                onChange={(e) => setOfflineSort(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-xl px-3 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-600 cursor-pointer"
              >
                <option value="date_desc">Newest Downloaded</option>
                <option value="date_asc">Oldest Downloaded</option>
                <option value="title_asc">Title (A - Z)</option>
                <option value="title_desc">Title (Z - A)</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isLoading && <Loader2 className="animate-spin text-emerald-600" size={18} />}
            <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-2.5 py-1 rounded-lg">
              {displayBooks.length} {displayBooks.length === 1 ? 'eBook' : 'eBooks'}
            </span>
          </div>
        </div>

        {/* Book Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 min-h-[360px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-stone-200/60 rounded-2xl aspect-[2/3] animate-pulse" />
            ))}
          </div>
        ) : displayBooks.length > 0 ? (
          <div id="book-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 min-h-[360px]">
            <AnimatePresence mode="popLayout">
              {displayBooks.map((book, index) => (
                book && (
                  <BookCard
                    key={book.id || index}
                    book={book}
                    isBookmarked={userState.bookmarks.includes(book.id)}
                    isDownloaded={userState.downloads.some(b => b.id === book.id)}
                    onToggleBookmark={toggleBookmark}
                    onToggleDownload={toggleDownload}
                    onRead={setReadingBook}
                    onShowDetail={setSelectedBook}
                    priority={index < 4}
                    reviews={userState.reviews?.[book.id] || []}
                  />
                )
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Robust, Beautiful Empty State Handling */
          <div className="min-h-[400px] flex items-center justify-center">
            {activeTab === 'all' || activeTab === 'search' ? (
              <EmptyCatalogState
                isSearchOrFiltered={isSearchOrFiltered}
                searchQuery={searchQuery}
                genre={genre}
                onClearFilters={clearFilters}
                onOpenUpload={() => {
                  if (isAdmin(userState)) {
                    setIsAdminModalOpen(true);
                  } else {
                    showToast('Akses Ditolak (403): Hanya Administrator yang dapat menambah buku.', 'error');
                  }
                }}
                isAdmin={isAdmin(userState)}
                onRefresh={loadBooks}
                onLoginClick={() => setIsProfileOpen(true)}
              />
            ) : activeTab === 'bookmarks' ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 px-6 max-w-md mx-auto flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-stone-200 shadow-sm"
              >
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                  <Heart size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No Bookmarks Yet</h3>
                <p className="text-stone-500 text-xs leading-relaxed mb-6">
                  Save books to your personal wishlist by clicking the bookmark icon on any book cover.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Explore Catalog
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 px-6 max-w-md mx-auto flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-stone-200 shadow-sm"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Download size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Offline Library Empty</h3>
                <p className="text-stone-500 text-xs leading-relaxed mb-6">
                  Download eBooks to read offline at any time without an active internet connection.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Browse Catalog
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Dynamic Pagination */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button 
              type="button"
              disabled={currentPage === 1 || isLoading}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl border border-stone-200 bg-white disabled:opacity-30 hover:bg-stone-50 transition-colors shadow-xs"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-bold text-stone-700 px-3 py-1.5 rounded-lg bg-stone-100">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              type="button"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl border border-stone-200 bg-white disabled:opacity-30 hover:bg-stone-50 transition-colors shadow-xs"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
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
            reviews={userState.reviews?.[selectedBook.id] || []}
            onAddReview={(rating, text) => addReview(selectedBook.id, rating, text)}
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

      {/* Download Offline Confirmation Dialog */}
      <AnimatePresence>
        {bookToDownload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-stone-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Download size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">Download eBook?</h3>
              <p className="text-stone-600 mb-6 text-xs leading-relaxed">
                Save <span className="font-bold text-stone-900">&quot;{bookToDownload.judul || bookToDownload.title}&quot;</span> to your device for offline reading without an internet connection.
              </p>
              <div className="flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setBookToDownload(null)} 
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold transition-colors text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={confirmDownload} 
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-colors shadow-md shadow-emerald-200 text-xs cursor-pointer"
                >
                  Download Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tubelight Bottom Navigation Bar */}
      <NavBar 
        items={navItems} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {/* Profile & Account Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        username={userState.username}
        email={userState.email}
        onLogin={(u, e) => {
          loginUserAccount(u, e);
          showToast(`Welcome back, ${u}!`, 'success');
        }}
        onLogout={() => {
          logoutUserAccount();
          showToast('Signed out successfully.', 'info');
          setIsProfileOpen(false);
        }}
        onDeleteDataSuccess={(msg) => {
          showToast(msg, 'success');
        }}
        onWishlistClick={() => {
          setIsProfileOpen(false);
          setActiveTab('bookmarks');
          setCurrentPage(1);
        }}
        onDownloadOfflineClick={() => {
          setIsProfileOpen(false);
          setActiveTab('downloads');
          setCurrentPage(1);
        }}
        onTransaksiClick={() => {
          setIsProfileOpen(false);
          router.push('/transaksi');
        }}
        onAkunClick={() => {
          setIsProfileOpen(false);
          router.push('/akun');
        }}
        onLiveChatClick={() => {
          setIsProfileOpen(false);
          router.push('/live-chat');
        }}
        onSyaratKetentuanClick={() => {
          setIsProfileOpen(false);
          router.push('/syarat-ketentuan');
        }}
        onKebijakanPrivasiClick={() => {
          setIsProfileOpen(false);
          router.push('/kebijakan-privasi');
        }}
        onProfileClick={() => {
          setIsProfileOpen(false);
          router.push('/profile');
        }}
      />

      {/* Admin eBook Management Studio Modal */}
      <AdminBookManagementModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        catalogBooks={apiBooks}
        onCatalogChanged={loadBooks}
        onShowToast={showToast}
      />

      {/* Catalog Filter & Sort Modal */}
      <CatalogFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        genre={genre}
        onGenreChange={handleGenreChange}
        sort={sort}
        onSortChange={handleSortChange}
        year={year}
        onYearChange={handleYearChange}
        availableGenres={availableGenres}
        totalResults={displayBooks.length}
        onReset={clearFilters}
      />

      {/* Action Toast Notifications */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </main>
  );
}
