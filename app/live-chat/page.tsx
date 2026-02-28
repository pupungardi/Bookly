'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function LiveChatPage() {
  const router = useRouter();
  const [message, setMessage] = React.useState('');

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col h-screen">
      <header className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-stone-900 leading-none">Customer Support</h1>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
        <div className="bg-white p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm border border-stone-100 self-start">
          <p className="text-sm text-stone-800">Halo! Ada yang bisa kami bantu hari ini?</p>
          <span className="text-[10px] text-stone-400 mt-1 block">08:30 AM</span>
        </div>
      </main>

      <footer className="p-4 bg-white border-t border-stone-100 shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100">
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
