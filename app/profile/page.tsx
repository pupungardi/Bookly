'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Calendar, MapPin, Edit2, Camera, CircleUserRound } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const router = useRouter();

  // Mock user data - in a real app this would come from a state management or API
  const user = {
    name: 'Pengguna Setia',
    email: 'pengguna@example.com',
    joinDate: 'Januari 2024',
    location: 'Jakarta, Indonesia',
    bio: 'Pecinta buku fiksi dan sejarah. Selalu mencari petualangan baru di setiap halaman.',
    stats: [
      { label: 'Buku Dibaca', value: '24' },
      { label: 'Wishlist', value: '12' },
      { label: 'Ulasan', value: '8' },
    ]
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-stone-900">Profil Saya</h1>
        </div>
        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
          <Edit2 size={20} />
        </button>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6">
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-stone-100 mb-6"
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600/30 border-4 border-white shadow-xl overflow-hidden">
                <CircleUserRound size={80} strokeWidth={1.5} />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors border-2 border-white">
                <Camera size={16} />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-stone-900">{user.name}</h2>
            <p className="text-stone-500 text-sm mt-1">{user.email}</p>
            
            <div className="flex gap-8 mt-8 w-full justify-center border-t border-stone-50 pt-8">
              {user.stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-xl font-bold text-stone-900">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 mb-6"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Tentang Saya</h3>
          <p className="text-stone-700 leading-relaxed">{user.bio}</p>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-4 text-stone-600">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Lokasi</div>
                <div className="text-sm font-semibold">{user.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-stone-600">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-stone-400">Bergabung Sejak</div>
                <div className="text-sm font-semibold">{user.joinDate}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 mb-6"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6">Aktivitas Terbaru</h3>
          <div className="space-y-6">
            {[
              { action: 'Selesai membaca', book: 'The Great Gatsby', time: '2 hari yang lalu' },
              { action: 'Menambahkan ke wishlist', book: 'Atomic Habits', time: '5 hari yang lalu' },
              { action: 'Memberikan ulasan', book: '1984', time: '1 minggu yang lalu' },
            ].map((activity, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <div>
                  <div className="text-sm text-stone-800">
                    <span className="font-medium">{activity.action}</span>
                    <span className="mx-1 text-stone-400">buku</span>
                    <span className="font-bold text-emerald-700 italic">&quot;{activity.book}&quot;</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1 uppercase font-bold tracking-wider">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-4 rounded-2xl border border-stone-100 font-bold text-stone-700 hover:bg-stone-50 transition-colors">
            Bagikan Profil
          </button>
          <button className="bg-emerald-600 p-4 rounded-2xl text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
            Edit Profil
          </button>
        </div>
      </main>
    </div>
  );
}
