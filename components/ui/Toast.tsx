'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'success',
  title,
  isVisible,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[300] max-w-sm w-full pointer-events-none px-2">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
              type === 'error'
                ? 'bg-red-950/90 border-red-800 text-white shadow-red-950/30'
                : type === 'info'
                ? 'bg-stone-900/90 border-stone-800 text-white shadow-stone-950/30'
                : 'bg-stone-900/95 border-stone-800/80 text-white shadow-stone-950/30'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="shrink-0 mt-0.5">
              {type === 'error' ? (
                <AlertCircle size={18} className="text-red-400" />
              ) : type === 'info' ? (
                <Info size={18} className="text-sky-400" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-400" />
              )}
            </div>

            <div className="flex-1 text-xs">
              {title && (
                <div className="font-bold text-stone-100 mb-0.5 text-sm">
                  {title}
                </div>
              )}
              <div className="text-stone-300 leading-relaxed font-medium">
                {message}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup notifikasi"
              className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[300] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-800 text-white'
                : toast.type === 'info'
                ? 'bg-stone-900/90 border-stone-800 text-white'
                : 'bg-stone-900/95 border-stone-800/80 text-white'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'error' ? (
                <AlertCircle size={18} className="text-red-400" />
              ) : toast.type === 'info' ? (
                <Info size={18} className="text-sky-400" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-400" />
              )}
            </div>

            <div className="flex-1 text-xs">
              {toast.title && (
                <div className="font-bold text-stone-100 mb-0.5 text-sm">
                  {toast.title}
                </div>
              )}
              <div className="text-stone-300 leading-relaxed font-medium">
                {toast.message}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Tutup notifikasi"
              className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

