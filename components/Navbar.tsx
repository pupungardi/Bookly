'use client';

import React from 'react';
import { CircleUserRound, Database, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'all' | 'bookmarks' | 'downloads' | 'search') => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
  catalogCount?: number;
}

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onProfileClick,
  onAdminClick,
  catalogCount = 0,
}: NavbarProps) {
  return (
    <nav className="relative z-50 bg-white border-b border-stone-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => setActiveTab('all')}
        >
          <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-emerald-200/50 overflow-hidden group-hover:scale-105 transition-transform">
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
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold tracking-tight text-stone-900 leading-none">
              Book<span className="text-emerald-600">ly</span>
            </span>
            <span className="text-[10px] text-stone-400 font-medium tracking-wide">
              Digital eBook Platform
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 mx-2"></div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Admin eBook Studio CMS Button */}
          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="px-3.5 py-2 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-stone-200/80 cursor-pointer active:scale-95 shadow-xs"
              title="Open Admin eBook Management Studio"
            >
              <Database size={15} className="text-emerald-600" />
              <span className="hidden sm:inline">Admin CMS</span>
              <span className="bg-stone-200/80 text-stone-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {catalogCount}
              </span>
            </button>
          )}

          {/* Profile / Account Button */}
          <button 
            type="button"
            onClick={onProfileClick}
            aria-label="User profile & settings"
            className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shrink-0 cursor-pointer active:scale-95 shadow-xs"
          >
            <CircleUserRound size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </nav>
  );
}
