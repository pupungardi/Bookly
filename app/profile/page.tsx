'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Mail, Calendar, MapPin, Edit2, Camera, CircleUserRound, 
  ShieldCheck, Shield, Bookmark, Download, BookOpen, MessageSquare, ArrowRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { getStoredUserState, switchUserRole } from '@/lib/auth-storage';
import { isAdmin, ROLE_METADATA } from '@/lib/rbac';
import { UserState } from '@/types/book';

export default function ProfilePage() {
  const router = useRouter();
  const [userState, setUserState] = useState<UserState>(() => getStoredUserState());

  useEffect(() => {
    const handleSync = () => {
      setUserState(getStoredUserState());
    };
    window.addEventListener('bookly_user_state_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('bookly_user_state_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const isUserAdmin = isAdmin(userState);
  const currentRole = userState.role || 'user';
  const roleMeta = ROLE_METADATA[currentRole];

  const stats = [
    { label: 'Buku Diunduh', value: String(userState.downloads?.length || 0) },
    { label: 'Wishlist', value: String(userState.bookmarks?.length || 0) },
    { label: 'Ulasan', value: String(Object.keys(userState.reviews || {}).length) },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.push('/')} 
            className="p-2 -ml-2 hover:bg-stone-100 rounded-full transition-colors active:scale-95 text-stone-600 hover:text-stone-900"
            aria-label="Kembali"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-bold text-stone-900">Profil Pengguna</h1>
        </div>

        <button 
          type="button"
          onClick={() => router.push('/akun')} 
          className="text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-1.5 rounded-full transition-colors"
        >
          Pengaturan Akun
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-stone-200/80 relative overflow-hidden"
        >
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-5">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ${
                isUserAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600/40'
              }`}>
                {isUserAdmin ? <ShieldCheck size={64} strokeWidth={1.8} /> : <CircleUserRound size={80} strokeWidth={1.5} />}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900">
              {userState.username || 'Pengguna Tamu'}
            </h2>
            <p className="text-stone-500 text-sm mt-0.5">
              {userState.email || 'Belum masuk dengan akun'}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${roleMeta.badgeClass}`}>
                {roleMeta.name}
              </span>
            </div>

            {/* Quick RBAC Switcher for preview verification */}
            {userState.username && (
              <div className="mt-5 pt-4 border-t border-stone-100 w-full flex items-center justify-center gap-3">
                <span className="text-xs text-stone-500 font-medium">Ubah Peran (Tes RBAC):</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => switchUserRole('admin')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      currentRole === 'admin' 
                        ? 'bg-emerald-600 text-white shadow-sm' 
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
                        ? 'bg-stone-800 text-white shadow-sm' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    User Biasa
                  </button>
                </div>
              </div>
            )}
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-6 w-full border-t border-stone-100 pt-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-stone-50/80 rounded-2xl p-3 border border-stone-100 text-center">
                  <div className="text-xl font-bold text-stone-900">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-stone-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Admin Access Quick Banner (If Administrator) */}
        {isUserAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white flex items-center justify-between gap-4 shadow-lg shadow-emerald-950/10 border border-emerald-800/40"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Panel Admin Aktif</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">RBAC Terverifikasi</span>
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">Kelola katalog buku, filter, dan parameter otorisasi sistem.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <span>Buka Admin</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Permissions & Security Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200/80"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-3">Hak Akses & Otorisasi RBAC</h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            {roleMeta.description}. Sistem menggunakan verifikasi ganda di sisi Klien (UI Guards, Next.js Middleware) dan Server (API Authorization Validators).
          </p>

          <div className="space-y-2">
            {[
              { name: 'Membaca & Mencari Buku', allowed: true },
              { name: 'Menyimpan Bookmark & Unduhan Offline', allowed: true },
              { name: 'Menulis Ulasan & Rating', allowed: Boolean(userState.username) },
              { name: 'Akses CMS Admin & Pengeditan Buku', allowed: isUserAdmin },
              { name: 'Menghapus Buku dari Server Database', allowed: isUserAdmin },
            ].map((perm, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0 text-xs">
                <span className="font-medium text-stone-700">{perm.name}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  perm.allowed 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-stone-100 text-stone-400'
                }`}>
                  {perm.allowed ? 'Diizinkan' : 'Dibatasi'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
