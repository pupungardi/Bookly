'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ChevronLeft, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  UserCheck, 
  Lock, 
  Unlock, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink,
  Sliders,
  Sparkles,
  Info,
  KeyRound,
  Shield
} from 'lucide-react';
import { Book, UserState, UserRole } from '@/types/book';
import { getStoredUserState, switchUserRole, isCurrentAdmin } from '@/lib/auth-storage';
import { isAdmin, ROLE_METADATA, ROLE_PERMISSIONS, hasPermission } from '@/lib/rbac';
import { fetchBooks, deleteBook, clearAllCatalog } from '@/lib/api';
import AdminBookManagementModal from '@/components/AdminBookManagementModal';
import Toast from '@/components/ui/Toast';

export default function AdminPage() {
  const router = useRouter();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  // Load books catalog
  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchBooks({ limit: 100 });
      setBooks(res.books);
    } catch (err) {
      console.error('Failed to load books for admin', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check RBAC Authorization on mount and state changes
  useEffect(() => {
    const checkAuth = () => {
      const state = getStoredUserState();
      setUserState(state);

      const adminAccess = isAdmin(state);
      setIsAuthorized(adminAccess);

      if (adminAccess) {
        loadCatalog();
      }
    };

    checkAuth();

    window.addEventListener('bookly_user_state_changed', checkAuth);
    return () => window.removeEventListener('bookly_user_state_changed', checkAuth);
  }, [loadCatalog]);

  // Handle countdown and auto-redirect if unauthorized
  useEffect(() => {
    if (isAuthorized === false) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.replace('/?access_denied=admin');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAuthorized, router]);

  const handleRoleSwitch = (newRole: UserRole) => {
    const updated = switchUserRole(newRole);
    setUserState(updated);
    if (newRole === 'admin') {
      setIsAuthorized(true);
      showToast('Peran berhasil diubah menjadi Administrator (Akses Diberikan).', 'success');
      loadCatalog();
    } else {
      setIsAuthorized(false);
      showToast(`Peran diubah menjadi '${newRole}'. Akses Admin dicabut.`, 'info');
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${title}" dari katalog?`)) {
      return;
    }

    const res = await deleteBook(bookId);
    if (res.success) {
      showToast(`Buku "${title}" berhasil dihapus.`, 'success');
      loadCatalog();
    } else {
      showToast(res.error || 'Gagal menghapus buku.', 'error');
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.judul || b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.genre || b.category || '').toLowerCase().includes(q)
    );
  });

  // 1. Loading state during hydration
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-600 font-medium text-sm">Memverifikasi Izin Administrator...</p>
        </div>
      </div>
    );
  }

  // 2. Access Denied State (Unauthorized / Non-Admin)
  if (isAuthorized === false) {
    const currentRole = userState?.role || 'guest';
    const meta = ROLE_METADATA[currentRole];

    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6 selection:bg-red-100 selection:text-red-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 relative overflow-hidden"
        >
          {/* Accent red banner */}
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ShieldAlert size={36} strokeWidth={2.2} />
          </div>

          <div className="text-center space-y-2 mb-6">
            <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200 tracking-wider uppercase font-mono">
              HTTP 403 Forbidden
            </span>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Akses Ditolak
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
              Halaman Panel Administrator dilindungi oleh sistem <strong className="text-stone-900">Role-Based Access Control (RBAC)</strong>. Akun Anda tidak memiliki hak istimewa Administrator.
            </p>
          </div>

          {/* Current Identity & Role Details */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 mb-6 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-stone-500 pb-2 border-b border-stone-200/70">
              <span>Status Akun:</span>
              <span className="font-semibold text-stone-900">{userState?.username || 'Pengunjung Tamu'}</span>
            </div>
            <div className="flex items-center justify-between text-stone-500 pb-2 border-b border-stone-200/70">
              <span>Peran Saat Ini:</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${meta.badgeClass}`}>
                {meta.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-500">
              <span>Izin Diperlukan:</span>
              <span className="font-mono font-bold text-red-600">admin:access</span>
            </div>
          </div>

          {/* Live RBAC Quick Testing Switcher */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 mb-6">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-2">
              <Sparkles size={14} className="text-emerald-700" />
              <span>Simulasi Uji RBAC (Beralih Peran):</span>
            </div>
            <p className="text-stone-600 text-xs mb-3">
              Anda dapat beralih ke peran Administrator untuk menguji dan membuka panel ini:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <KeyRound size={13} />
                <span>Beralih ke Admin</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="py-2 px-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-xs transition-all active:scale-95"
              >
                Halaman Masuk
              </button>
            </div>
          </div>

          {/* Auto Redirect Notice & Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.replace('/?access_denied=admin')}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <ChevronLeft size={16} />
              <span>Kembali ke Beranda ({redirectCountdown}s)</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. Authorized Admin Panel View
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors active:scale-95"
              title="Kembali ke Beranda Pengguna"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-200/60">
                <Database size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight leading-none">
                    Admin Studio & CMS
                  </h1>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold rounded-full tracking-wide">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Panel Manajemen Buku Berbasis Role-Based Access Control (RBAC)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedBookForEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>Tambah eBook</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl text-xs font-bold transition-all"
            >
              Lihat Beranda
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Security & RBAC Status Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  RBAC Sesi Terverifikasi • Tingkat Akses Penuh
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Selamat Datang di Pusat Kontrol Administrator
              </h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Anda masuk sebagai <strong className="text-white">{userState?.username || 'Administrator'}</strong> ({userState?.email || 'admin@bookly.id'}). Akses ke endpoint pembuatan, pengubahan, dan penghapusan buku terotorisasi penuh di tingkat server dan klien.
              </p>
            </div>

            {/* Quick Role Toggle Tool */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 shrink-0 w-full md:w-auto">
              <div className="text-[11px] font-bold text-emerald-200 mb-2 flex items-center gap-1.5">
                <Sliders size={13} />
                <span>Simulasi Peran Pengguna (Live Test RBAC):</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userState?.role === 'admin'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-emerald-100'
                  }`}
                >
                  Admin (Aktif)
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSwitch('user')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-stone-200 transition-all"
                  title="Ubah peran ke User biasa untuk menguji blokir akses"
                >
                  Ubah ke User Biasa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Catalog Stats & Management Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Katalog eBook</span>
              <p className="text-2xl font-bold text-stone-900 mt-1">{books.length} Buku</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Server-Side API Guard</span>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">Aktif & Terlindungi (403)</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Lock size={22} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Token Otorisasi</span>
              <p className="text-xs font-mono font-bold text-stone-700 mt-1 truncate max-w-[170px]">
                {userState?.token ? `${userState.token.substring(0, 18)}...` : 'Sesi Valid'}
              </p>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <KeyRound size={22} />
            </div>
          </div>
        </div>

        {/* Book Catalog Table Section */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-stone-500" />
              <h3 className="font-bold text-stone-900 text-base">Daftar Buku dalam Katalog</h3>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs font-bold">
                {filteredBooks.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari judul, genre, penulis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 transition-all text-stone-900"
                />
              </div>
              <button
                type="button"
                onClick={loadCatalog}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
                title="Muat ulang katalog"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Book List / Table */}
          {isLoading ? (
            <div className="p-12 text-center text-stone-500 text-xs">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
              <span>Memuat data katalog...</span>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <BookOpen size={24} />
              </div>
              <p className="text-sm font-bold text-stone-700">Tidak ada buku yang cocok dengan pencarian</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-all"
              >
                Tambah Buku Pertama
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-4 hover:bg-stone-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 relative">
                      {book.cover ? (
                        <Image
                          src={book.cover}
                          alt={book.judul || book.title || 'Cover'}
                          fill
                          sizes="48px"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
                          <BookOpen size={16} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-stone-900 truncate">
                        {book.judul || book.title}
                      </h4>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {book.author || 'Penulis Tidak Diketahui'} • {book.year || '2024'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100">
                          {book.genre || book.category || 'General'}
                        </span>
                        {book.pdfUrl && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded">
                            PDF Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBookForEdit(book);
                        setIsModalOpen(true);
                      }}
                      className="p-2 bg-stone-100 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                      title="Edit metadata buku"
                    >
                      <Edit3 size={15} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book.id, book.judul || book.title || 'Buku')}
                      className="p-2 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                      title="Hapus buku dari katalog"
                    >
                      <Trash2 size={15} />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Admin Book Management Modal */}
      <AdminBookManagementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBookForEdit(null);
        }}
        catalogBooks={books}
        onCatalogChanged={loadCatalog}
        onShowToast={showToast}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
