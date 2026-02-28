'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function KebijakanPrivasiPage() {
  const router = useRouter();

  const policies = [
    { title: 'Informasi yang Kami Kumpulkan', content: 'Kami mengumpulkan informasi yang Anda berikan saat mendaftar, seperti nama, email, dan preferensi membaca Anda.' },
    { title: 'Bagaimana Kami Menggunakan Data', content: 'Data Anda digunakan untuk personalisasi pengalaman membaca, memproses transaksi, dan meningkatkan layanan kami.' },
    { title: 'Keamanan Data', content: 'Kami menerapkan standar keamanan industri untuk melindungi informasi pribadi Anda dari akses yang tidak sah.' },
    { title: 'Berbagi Informasi', content: 'Kami tidak menjual informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Kebijakan Privasi</h1>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Privasi Anda</h2>
              <p className="text-xs text-stone-500">Terakhir diperbarui: 27 Februari 2026</p>
            </div>
          </div>

          <div className="space-y-8">
            {policies.map((policy, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-stone-900 mb-2">{policy.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{policy.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
