'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

export default function DaftarPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Daftar</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
              <UserPlus size={40} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Buat Akun Baru</h2>
            <p className="text-stone-500 text-sm mt-2">Mulai petualangan membaca Anda bersama kami.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Username</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-stone-900"
                placeholder="Pilih username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-stone-900"
                placeholder="Alamat email Anda"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all mt-4"
            >
              Daftar Sekarang
            </button>
          </form>

          <p className="text-center mt-6 text-stone-500 text-sm">
            Sudah punya akun? <button onClick={() => router.push('/login')} className="text-emerald-600 font-bold hover:underline">Masuk di sini</button>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
