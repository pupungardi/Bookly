'use client';

import React from 'react';
import { Search, BookOpen, Bookmark, Download, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'all' | 'bookmarks' | 'downloads';
  setActiveTab: (tab: 'all' | 'bookmarks' | 'downloads') => void;
}

export default function Navbar({ searchQuery, setSearchQuery, activeTab, setActiveTab }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const tabs = [
    { id: 'all', label: 'All Books', icon: BookOpen },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'downloads', label: 'Offline', icon: Download },
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('all')}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <BookOpen size={24} />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight text-emerald-900 hidden sm:block">Bookly</span>
        </div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-full focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none text-sm"
          />
        </div>

        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          className="md:hidden p-2 text-stone-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-stone-200 p-4 flex flex-col gap-2 shadow-xl"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-stone-500 hover:bg-stone-50'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
