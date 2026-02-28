'use client';

import React from 'react';
import { CircleUserRound } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'all' | 'bookmarks' | 'downloads' | 'search') => void;
  onProfileClick: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onProfileClick }: NavbarProps) {
  return (
    <nav className="relative z-50 bg-white border-b border-stone-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('all')}>
          <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50 overflow-hidden group-hover:scale-105 transition-transform">
            {/* Stylized Book Logo */}
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 relative z-10">
              <path d="M16 6C16 6 11.5 3 6 3C4.5 3 3 3.5 3 5V25C4.5 24 6 23.5 8 23.5C11.5 23.5 16 26 16 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6C16 6 20.5 3 26 3C27.5 3 29 3.5 29 5V25C27.5 24 26 23.5 24 23.5C20.5 23.5 16 26 16 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 6V26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 10H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 10H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 14H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full blur-md"></div>
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight text-stone-800 hidden sm:block">
            Book<span className="text-emerald-600">ly</span>
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1 mx-2"></div>

        {/* Profile Button */}
        <button 
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shrink-0"
        >
          <CircleUserRound size={20} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
}
