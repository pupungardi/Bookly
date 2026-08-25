'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Shield, 
  Bell, 
  LogOut, 
  Trash2, 
  Database, 
  BookOpen, 
  Download, 
  Bookmark, 
  MessageSquare, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CircleUserRound,
  ExternalLink,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStoredUserState, logoutUserAccount, switchUserRole } from '@/lib/auth-storage';
import { UserState } from '@/types/book';
import { isAdmin, ROLE_METADATA } from '@/lib/rbac';
import DeleteBookDataModal from '@/components/DeleteBookDataModal';
import Toast from '@/components/ui/Toast';

export default function AkunPage() {
  const router = useRouter();
  const [userState, setUserState] = useState<UserState>(() => getStoredUserState());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    const handleSync = () => {
      const state = getStoredUserState();
      setUserState(state);
    };
    window.addEventListener('bookly_user_state_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bookly_user_state_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleLogout = () => {
    logoutUserAccount();
    showToast('Anda berhasil keluar dari akun.', 'info');
    setTimeout(() => {
      router.push('/');
    }, 400);
  };

  const isUserAdmin = isAdmin(userState);
  const currentRole = userState.role || 'user';
  const roleMeta = ROLE_METADATA[currentRole];

  const downloadsCount = userState.downloads?.length || 0;
  const bookmarksCount = userState.bookmarks?.length || 0;
  const historyCount = Object.keys(userState.lastRead || {}).length;
  const reviewsCount = Object.keys(userState.reviews || {}).length;
  const totalLocalItems = downloadsCount + bookmarksCount + historyCount + reviewsCount;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/70 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors active:scale-95"
            aria-label="Kembali"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-stone-900">Pengaturan Akun & Data</h1>
        </div>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-emerald-200"
        >
          Ke Beranda
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* User Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80 relative overflow-hidden"
        >
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
              isUserAdmin ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {isUserAdmin ? <ShieldCheck size={40} /> : <CircleUserRound size={44} strokeWidth={1.5} />}
            </div>

            <div className="flex-1 min-w-0">
              {userState.username ? (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-stone-900 truncate">{userState.username}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${roleMeta.badgeClass}`}>
                      {roleMeta.name}
                    </span>
                  </div>
                  <p className="text-stone-500 text-xs sm:text-sm truncate mt-0.5">{userState.email}</p>
                  <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Tersinkronisasi dengan RBAC Matrix & Auth Token</span>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-stone-900">Tamu (Belum Masuk)</h2>
                  <p className="text-stone-500 text-xs mt-0.5">Masuk untuk mencadangkan buku dan catatan bacaan Anda.</p>
                  <div className="flex gap-2.5 mt-3">
                    <button
                      type="button"
                      onClick={() => router.push('/login')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/daftar')}
                      className="px-4 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      Daftar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick RBAC Role Switch for Testing & Verification */}
          {userState.username && (
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-semibold">Simulasi Peran RBAC:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchUserRole('admin')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentRole === 'admin' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchUserRole('user')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    currentRole === 'user' 
                      ? 'bg-stone-800 text-white shadow-xs' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  User Biasa
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Admin Shortcut Box (Only for Admin) */}
        {isUserAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-emerald-950 text-white flex items-center justify-between border border-emerald-800/60 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Panel Administrator</h4>
                <p className="text-xs text-stone-300">Kelola buku, edit data katalog & otorisasi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Buka Panel
            </button>
          </motion.div>
        )}

        {/* Data & Storage Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">Manajemen Data Buku & Penyimpanan</h3>
                <p className="text-stone-500 text-xs">Kelola buku unduhan, penanda halaman, dan riwayat bacaan</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-xs">
              {totalLocalItems} Item Tersimpan
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
            <div className="bg-stone-50/80 rounded-2xl p-3 border border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold">
                <Download size={13} className="text-emerald-600" />
                <span>Unduhan</span>
              </div>
              <p className="text-lg font-bold text-stone-900 mt-1">{downloadsCount} buku</p>
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-3 border border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold">
                <Bookmark size={13} className="text-blue-600" />
                <span>Bookmark</span>
              </div>
              <p className="text-lg font-bold text-stone-900 mt-1">{bookmarksCount} buku</p>
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-3 border border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold">
                <BookOpen size={13} className="text-purple-600" />
                <span>Riwayat Baca</span>
              </div>
              <p className="text-lg font-bold text-stone-900 mt-1">{historyCount} buku</p>
            </div>

            <div className="bg-stone-50/80 rounded-2xl p-3 border border-stone-100">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold">
                <MessageSquare size={13} className="text-amber-600" />
                <span>Ulasan</span>
              </div>
              <p className="text-lg font-bold text-stone-900 mt-1">{reviewsCount} item</p>
            </div>
          </div>

          {/* Delete Book Data CTA Button */}
          <div className="mt-5 p-4 rounded-2xl bg-red-50/70 border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900">Hapus Data Buku & Cache</h4>
                <p className="text-xs text-red-700/80 mt-0.5 leading-relaxed">
                  Bebaskan ruang penyimpanan dan hapus file buku offline atau riwayat dengan dialog konfirmasi aman.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Hapus Data
            </button>
          </div>
        </motion.div>

        {/* Settings Links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200/80 space-y-1.5"
        >
          <div 
            onClick={() => router.push('/profile')}
            className="w-full p-3.5 rounded-2xl flex items-center justify-between hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer border border-stone-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Informasi Profil Publik</h4>
                <p className="text-xs text-stone-500">Lihat profil pembaca, statistik bacaan & bio</p>
              </div>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-stone-400" />
          </div>

          <div 
            onClick={() => router.push('/syarat-ketentuan')}
            className="w-full p-3.5 rounded-2xl flex items-center justify-between hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer border border-stone-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-stone-50 text-stone-700 rounded-xl flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Syarat & Ketentuan Layanan</h4>
                <p className="text-xs text-stone-500">Kebijakan penggunaan platform Bookly</p>
              </div>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-stone-400" />
          </div>

          <div 
            onClick={() => router.push('/kebijakan-privasi')}
            className="w-full p-3.5 rounded-2xl flex items-center justify-between hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer border border-stone-100"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 bg-stone-50 text-stone-700 rounded-xl flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">Kebijakan Privasi & Enkripsi</h4>
                <p className="text-xs text-stone-500">Perlindungan data pribadi Anda</p>
              </div>
            </div>
            <ChevronLeft size={18} className="rotate-180 text-stone-400" />
          </div>
        </motion.div>

        {/* Logout Button if Logged In */}
        {userState.username && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full bg-white p-4 rounded-2xl flex items-center justify-center gap-2.5 border border-stone-200/80 hover:bg-red-50/50 hover:border-red-200 text-stone-700 hover:text-red-600 transition-all font-bold text-sm shadow-sm cursor-pointer active:scale-98"
            >
              <LogOut size={18} />
              <span>Keluar dari Akun</span>
            </button>
          </motion.div>
        )}
      </main>

      {/* Confirmation Dialog for Book Data Deletion */}
      <DeleteBookDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userState={userState}
        onSuccess={(msg) => {
          setUserState(getStoredUserState());
          showToast(msg, 'success');
        }}
      />

      {/* Toast Feedback */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  );
}
