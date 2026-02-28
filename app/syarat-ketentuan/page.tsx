'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function SyaratKetentuanPage() {
  const router = useRouter();

  const sections = [
    { title: '1. Penggunaan Layanan', content: 'Layanan kami disediakan untuk penggunaan pribadi dan non-komersial. Anda setuju untuk tidak menyalahgunakan platform kami.' },
    { title: '2. Akun Pengguna', content: 'Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun dan password Anda.' },
    { title: '3. Hak Kekayaan Intelektual', content: 'Semua konten buku yang tersedia di platform ini dilindungi oleh hak cipta dan hukum kekayaan intelektual lainnya.' },
    { title: '4. Pembatasan Tanggung Jawab', content: 'Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan kami.' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-stone-900">Syarat & Ketentuan</h1>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-stone-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
              <FileCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Ketentuan Layanan</h2>
              <p className="text-xs text-stone-500">Terakhir diperbarui: 27 Februari 2026</p>
            </div>
          </div>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-stone-900 mb-2">{section.title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
