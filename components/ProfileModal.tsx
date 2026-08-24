'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  X, User, Heart, Star, MessageCircle, 
  FileCheck, Shield, LogOut, ClipboardList, CircleUserRound, Download,
  Lock, Eye, EyeOff, Sparkles, ArrowRight, Trash2, BookOpen, ShieldAlert
} from 'lucide-react';
import DeleteBookDataModal from './DeleteBookDataModal';
import { UserState } from '@/types/book';
import { getStoredUserState } from '@/lib/auth-storage';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  email?: string;
  onLogin: (username: string, email: string) => void;
  onLogout: () => void;
  onWishlistClick: () => void;
  onDownloadOfflineClick?: () => void;
  onTransaksiClick?: () => void;
  onAkunClick?: () => void;
  onLiveChatClick?: () => void;
  onSyaratKetentuanClick?: () => void;
  onKebijakanPrivasiClick?: () => void;
  onProfileClick?: () => void;
  onDeleteDataSuccess?: (msg: string) => void;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  username, 
  email,
  onLogin,
  onLogout,
  onWishlistClick,
  onDownloadOfflineClick,
  onTransaksiClick,
  onAkunClick,
  onLiveChatClick,
  onSyaratKetentuanClick,
  onKebijakanPrivasiClick,
  onProfileClick,
  onDeleteDataSuccess
}: ProfileModalProps) {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [tempUsername, setTempUsername] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const bookshelfHeights = [
    35, 42, 58, 24, 45, 33, 52, 48, 39, 55, 28, 41, 
    37, 50, 44, 31, 49, 56, 22, 47, 34, 53, 40, 36
  ];

  const userState: UserState = getStoredUserState();
  const totalBookData = (userState.downloads?.length || 0) + (userState.bookmarks?.length || 0);

  const menuItems = [
    { icon: ClipboardList, label: 'Transaksi', action: onTransaksiClick },
    { icon: Heart, label: 'Wishlist & Bookmark', action: onWishlistClick, badge: userState.bookmarks?.length ? `${userState.bookmarks.length}` : undefined },
    { icon: Download, label: 'Download Offline', action: onDownloadOfflineClick, badge: userState.downloads?.length ? `${userState.downloads.length}` : undefined },
    { icon: User, label: 'Pengaturan Akun', action: onAkunClick },
    { divider: true },
    { 
      icon: Trash2, 
      label: 'Hapus Data Buku & Cache', 
      action: () => setIsDeleteModalOpen(true),
      isDestructive: true,
      desc: 'Bersihkan unduhan offline & riwayat'
    },
    { divider: true },
    { icon: MessageCircle, label: 'Live Chat Dukungan', action: onLiveChatClick },
    { icon: FileCheck, label: 'Syarat & Ketentuan', action: onSyaratKetentuanClick },
    { icon: Shield, label: 'Kebijakan Privasi', action: onKebijakanPrivasiClick },
    ...(username ? [
      { divider: true },
      { icon: LogOut, label: 'Keluar Akun', action: onLogout, isLogout: true }
    ] : []),
  ];

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim() && tempEmail.trim()) {
      onLogin(tempUsername.trim(), tempEmail.trim());
      setIsLoginView(false);
      setTempPassword('');
    }
  };

  const handleQuickDemoFill = () => {
    setTempUsername('Pembaca Setia');
    setTempEmail('pembaca@bookly.id');
    setTempPassword('demo12345');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative bg-white w-full max-w-md h-full md:h-auto md:max-h-[85vh] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col z-10"
            >
              {/* Top Bar */}
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <BookOpen size={14} />
                  </div>
                  <h1 className="text-lg font-bold text-stone-900">
                    {isLoginView ? (authMode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru') : 'Profil & Akun'}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => isLoginView ? setIsLoginView(false) : onClose()}
                  aria-label="Tutup panel"
                  className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
                {isLoginView ? (
                  <div className="p-6 sm:p-8">
                    {/* Mode Toggle Switch */}
                    <div className="flex p-1 bg-stone-100 rounded-2xl mb-6">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          authMode === 'login' 
                            ? 'bg-white text-stone-900 shadow-sm' 
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Masuk
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          authMode === 'register' 
                            ? 'bg-white text-stone-900 shadow-sm' 
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Daftar Baru
                      </button>
                    </div>

                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-stone-900">
                        {authMode === 'login' ? 'Selamat Datang Kembali' : 'Mulai Membaca di Bookly'}
                      </h2>
                      <p className="text-stone-500 text-xs mt-1">
                        {authMode === 'login' 
                          ? 'Akses rak buku dan riwayat bacaan Anda' 
                          : 'Dapatkan akses ribuan buku & sinkronisasi data'}
                      </p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 ml-1">
                          Username
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                            <User size={16} />
                          </div>
                          <input 
                            type="text" 
                            required
                            value={tempUsername}
                            onChange={(e) => setTempUsername(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm text-stone-900"
                            placeholder="Nama pengguna"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 ml-1">
                          Email
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                            <span className="text-xs font-bold">@</span>
                          </div>
                          <input 
                            type="email" 
                            required
                            value={tempEmail}
                            onChange={(e) => setTempEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm text-stone-900"
                            placeholder="nama@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 ml-1">
                          Kata Sandi
                        </label>
                        <div className="relative flex items-center">
                          <div className="absolute left-3.5 text-stone-400 pointer-events-none">
                            <Lock size={16} />
                          </div>
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm text-stone-900"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 p-1 text-stone-400 hover:text-stone-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Demo Quick Fill */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleQuickDemoFill}
                          className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <Sparkles size={12} className="text-amber-500" />
                          <span>Isi Akun Cepat</span>
                        </button>
                      </div>

                      {/* Primary Submit Button */}
                      <button 
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200/80 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
                      >
                        <span>{authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col gap-2.5 text-center">
                      <button 
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push(authMode === 'login' ? '/login' : '/daftar');
                        }}
                        className="text-stone-600 text-xs hover:text-emerald-700 font-medium hover:underline"
                      >
                        Buka Halaman Lengkap ({authMode === 'login' ? 'Masuk' : 'Daftar'})
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Profile Header Section */}
                    <div 
                      onClick={() => {
                        onClose();
                        router.push('/profile');
                      }}
                      className="relative pt-8 pb-7 flex flex-col items-center border-b border-stone-100 bg-stone-50/40 cursor-pointer hover:bg-stone-100/60 transition-colors group/header"
                    >
                      {/* Bookshelf Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.04] pointer-events-none overflow-hidden">
                        <div className="flex items-end justify-center gap-1 h-full px-4">
                          {bookshelfHeights.map((height, i) => (
                            <div 
                              key={i} 
                              className="bg-stone-900 rounded-t-sm shrink-0" 
                              style={{ 
                                width: '12px',
                                height: `${height}%` 
                              }} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="relative z-10 mb-4">
                        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-white group-hover/header:ring-emerald-100 transition-all">
                          <div className="text-emerald-600/40">
                            <CircleUserRound size={72} strokeWidth={1.5} />
                          </div>
                        </div>
                      </div>

                      {/* User Info & Quick Auth CTA */}
                      <div className="relative z-10 text-center px-6">
                        {username ? (
                          <>
                            <h2 className="text-xl font-bold text-stone-900 tracking-tight group-hover/header:text-emerald-700 transition-colors">
                              {username}
                            </h2>
                            <p className="text-stone-500 text-xs font-medium mt-0.5">{email}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Akun Terhubung
                            </span>
                          </>
                        ) : (
                          <div className="flex flex-col items-center">
                            <h2 className="text-lg font-bold text-stone-900 mb-1">Selamat Datang di Bookly</h2>
                            <p className="text-stone-500 text-xs mb-4">Masuk untuk menyimpan riwayat & sinkronisasi</p>
                            
                            {/* Distinct Button Hierarchy for Login / Register */}
                            <div className="flex items-center gap-2.5">
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAuthMode('login');
                                  setIsLoginView(true);
                                }}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200/80 hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all cursor-pointer"
                              >
                                Masuk
                              </button>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAuthMode('register');
                                  setIsLoginView(true);
                                }}
                                className="px-5 py-2.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm cursor-pointer"
                              >
                                Buat Akun
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Menu List */}
                    <div className="py-2">
                      {menuItems.map((item, index) => (
                        item.divider ? (
                          <div key={`divider-${index}`} className="my-1.5 border-t border-stone-100" />
                        ) : (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => item.action?.()}
                            className={`w-full flex items-center justify-between px-6 py-3.5 hover:bg-stone-50 active:bg-stone-100 transition-colors group text-left ${
                              item.isDestructive ? 'hover:bg-red-50/50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`transition-colors ${
                                item.isDestructive 
                                  ? 'text-red-500 group-hover:text-red-600' 
                                  : item.isLogout
                                  ? 'text-stone-400 group-hover:text-red-600'
                                  : 'text-stone-700 group-hover:text-emerald-600'
                              }`}>
                                {item.icon && <item.icon size={20} strokeWidth={1.8} />}
                              </div>
                              <div>
                                <span className={`text-sm font-semibold block ${
                                  item.isDestructive 
                                    ? 'text-red-600' 
                                    : item.isLogout 
                                    ? 'text-stone-700 group-hover:text-red-600' 
                                    : 'text-stone-800 group-hover:text-stone-900'
                                }`}>
                                  {item.label}
                                </span>
                                {item.desc && (
                                  <span className="text-[11px] text-stone-400 block font-normal">
                                    {item.desc}
                                  </span>
                                )}
                              </div>
                            </div>

                            {item.badge && (
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-bold">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        )
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Book Data Confirmation Dialog */}
      <DeleteBookDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userState={userState}
        onSuccess={(msg) => {
          if (onDeleteDataSuccess) onDeleteDataSuccess(msg);
        }}
      />
    </>
  );
}

