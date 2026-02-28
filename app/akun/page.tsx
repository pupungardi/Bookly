'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User, Mail, Shield, Bell, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export default function AkunPage() {
  const router = useRouter();

  const settings = [
    { icon: User, label: 'Informasi Pribadi', desc: 'Nama, Foto, dan Detail' },
    { icon: Mail, label: 'Email & Keamanan', desc: 'Password dan Verifikasi' },
    { icon: Bell, label: 'Notifikasi', desc: 'Pengaturan Pesan dan Update' },
    { icon: Shield, label: 'Privasi', desc: 'Kontrol Data Anda' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Pengaturan Akun</h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {settings.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="w-full bg-white p-5 rounded-2xl flex items-center gap-4 border border-stone-100 hover:border-emerald-200 transition-all group text-left"
            >
              <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <item.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-900">{item.label}</h3>
                <p className="text-xs text-stone-500">{item.desc}</p>
              </div>
            </motion.button>
          ))}

          <button className="w-full bg-red-50 p-5 rounded-2xl flex items-center gap-4 border border-red-100 hover:bg-red-100 transition-all text-left mt-8">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <LogOut size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-red-600">Keluar Akun</h3>
              <p className="text-xs text-red-400">Hapus sesi dari perangkat ini</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
