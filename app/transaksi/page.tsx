'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

export default function TransaksiPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Transaksi</h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-stone-100"
        >
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-6">
            <ClipboardList size={40} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Belum Ada Transaksi</h2>
          <p className="text-stone-500 max-w-xs mx-auto">Riwayat transaksi Anda akan muncul di sini setelah Anda melakukan pembelian atau peminjaman buku.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors"
          >
            Mulai Membaca
          </button>
        </motion.div>
      </main>
    </div>
  );
}
