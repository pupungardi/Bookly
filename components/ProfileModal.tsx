'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { 
  X, User, Heart, Map, Star, MessageCircle, 
  Info, FileCheck, Shield, Store, LogOut, ClipboardList, CircleUserRound, Download 
} from 'lucide-react';

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
  onProfileClick
}: ProfileModalProps) {
  const router = useRouter();
  const [isLoginView, setIsLoginView] = React.useState(false);
  const [tempUsername, setTempUsername] = React.useState('');
  const [tempEmail, setTempEmail] = React.useState('');

  const bookshelfHeights = [
    35, 42, 58, 24, 45, 33, 52, 48, 39, 55, 28, 41, 
    37, 50, 44, 31, 49, 56, 22, 47, 34, 53, 40, 36
  ];

  const menuItems = [
    { icon: ClipboardList, label: 'Transaksi', action: onTransaksiClick },
    { icon: Heart, label: 'Wishlist', action: onWishlistClick },
    { icon: Download, label: 'Download Offline', action: onDownloadOfflineClick },
    { icon: User, label: 'Akun', action: onAkunClick },
    { divider: true },
    { icon: MessageCircle, label: 'Live Chat', action: onLiveChatClick },
    { icon: FileCheck, label: 'Syarat & Ketentuan', action: onSyaratKetentuanClick },
    { icon: Shield, label: 'Kebijakan Privasi', action: onKebijakanPrivasiClick },
    { divider: true },
    { icon: LogOut, label: 'Keluar Akun', action: onLogout },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername && tempEmail) {
      onLogin(tempUsername, tempEmail);
      setIsLoginView(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative bg-white w-full max-w-md h-full md:h-auto md:max-h-[85vh] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:m-4"
          >
            {/* Top Bar */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
              <h1 className="text-xl font-bold text-stone-900">
                {isLoginView ? 'Masuk / Daftar' : 'Akun'}
              </h1>
              <button
                onClick={() => isLoginView ? setIsLoginView(false) : onClose()}
                className="p-1.5 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              {isLoginView ? (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                      <User size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900">Selamat Datang</h2>
                    <p className="text-stone-500 text-sm mt-2">Silakan masuk atau daftar untuk sinkronisasi data Anda.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Username</label>
                      <input 
                        type="text" 
                        required
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-stone-900"
                        placeholder="Masukkan username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                      <input 
                        type="email" 
                        required
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-stone-900"
                        placeholder="Masukkan email"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all mt-4"
                    >
                      Daftar / Masuk
                    </button>
                  </form>
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => {
                        onClose();
                        router.push('/login');
                      }}
                      className="text-emerald-600 font-bold text-sm hover:underline"
                    >
                      Buka Halaman Masuk Terpisah
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
                    className="relative pt-10 pb-8 flex flex-col items-center border-b border-stone-50 bg-stone-50/30 cursor-pointer hover:bg-stone-100/50 transition-colors group/header"
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
                    <div className="relative z-10 mb-5">
                      <div className="w-28 h-28 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden shadow-2xl ring-4 ring-white group-hover/header:ring-emerald-100 transition-all">
                        <div className="text-emerald-600/40">
                          <CircleUserRound size={80} strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="relative z-10 text-center px-6">
                      {username ? (
                        <>
                          <h2 className="text-2xl font-bold text-stone-900 tracking-tight group-hover/header:text-emerald-700 transition-colors">{username}</h2>
                          <p className="text-stone-400 text-sm font-medium mt-1">{email}</p>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <h2 className="text-xl font-bold text-stone-900 mb-4">Belum Masuk</h2>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => {
                                onClose();
                                router.push('/login');
                              }}
                              className="px-6 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all"
                            >
                              Masuk
                            </button>
                            <button 
                              onClick={() => {
                                onClose();
                                router.push('/daftar');
                              }}
                              className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-full text-sm font-bold hover:bg-stone-50 active:scale-95 transition-all"
                            >
                              Daftar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Menu List */}
                  <div className="py-3">
                    {menuItems.map((item, index) => (
                      item.divider ? (
                        <div key={`divider-${index}`} className="my-2 border-t border-stone-100" />
                      ) : (
                        <button
                          key={item.label}
                          onClick={() => item.action?.()}
                          className="w-full flex items-center gap-5 px-8 py-4 hover:bg-stone-50 active:bg-stone-100 transition-colors group"
                        >
                          <div className="text-stone-800 group-hover:text-emerald-600 transition-colors">
                            {item.icon && <item.icon size={24} strokeWidth={1.5} />}
                          </div>
                          <span className="text-[15px] font-semibold text-stone-800 group-hover:text-stone-900 transition-colors">{item.label}</span>
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
  );
}
