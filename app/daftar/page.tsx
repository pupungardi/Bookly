'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  BookOpen, 
  Check, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { registerUserAccount } from '@/lib/auth-storage';

export default function DaftarPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Kosong', color: 'bg-stone-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Lemah', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, label: 'Sedang', color: 'bg-amber-500' };
    return { score: 3, label: 'Kuat', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Silakan pilih nama pengguna.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Silakan masukkan alamat email yang valid.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi harus memiliki minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate real account provisioning
      await new Promise((resolve) => setTimeout(resolve, 650));

      registerUserAccount(username, email);

      setSuccessMessage(`Akun berhasil didaftarkan! Selamat bergabung, ${username}.`);

      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err) {
      setErrorMessage('Gagal membuat akun. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleSocialRegister = async (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    setErrorMessage('');
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const demoName = provider === 'Google' ? 'Google Reader' : 'Apple Reader';
    const demoMail = `${provider.toLowerCase()}.member@bookly.id`;
    
    registerUserAccount(demoName, demoMail);
    setSuccessMessage(`Berhasil mendaftar dengan akun ${provider}!`);
    
    setTimeout(() => {
      router.push('/');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/70 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push('/')} 
            className="p-2 -ml-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors active:scale-95"
            aria-label="Kembali ke Beranda"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <BookOpen size={16} strokeWidth={2.5} />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight text-stone-900">Bookly</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => router.push('/login')}
          className="text-xs font-bold text-stone-700 hover:text-emerald-700 bg-white hover:bg-stone-100/80 px-3.5 py-1.5 rounded-full transition-all border border-stone-200"
        >
          Sudah Punya Akun? Masuk
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white rounded-3xl md:rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-stone-200/50 border border-stone-200/80 relative overflow-hidden"
        >
          {/* Subtle Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

          {/* Form Header */}
          <div className="relative z-10 text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200/60 ring-4 ring-emerald-50">
              <UserPlus size={30} strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Buat Akun Baru</h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-1.5">
              Bergabung dengan ribuan pembaca dan akses ribuan buku gratis
            </p>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800"
              >
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Controls */}
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            {/* Username Input */}
            <div>
              <label htmlFor="reg-username-input" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 ml-1">
                Pilih Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-stone-400 pointer-events-none">
                  <User size={18} />
                </div>
                <input 
                  id="reg-username-input"
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm font-medium text-stone-900 placeholder:text-stone-400"
                  placeholder="Contoh: anandabuku"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="reg-email-input" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 ml-1">
                Alamat Email Aktif
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-stone-400 pointer-events-none">
                  <Mail size={18} />
                </div>
                <input 
                  id="reg-email-input"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm font-medium text-stone-900 placeholder:text-stone-400"
                  placeholder="nama@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input with Strength Indicator */}
            <div>
              <label htmlFor="reg-password-input" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 ml-1">
                Buat Kata Sandi
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-stone-400 pointer-events-none">
                  <Lock size={18} />
                </div>
                <input 
                  id="reg-password-input"
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm font-medium text-stone-900 placeholder:text-stone-400"
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  className="absolute right-3.5 p-1.5 text-stone-400 hover:text-stone-600 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Live Strength Bar */}
              {password.length > 0 && (
                <div className="mt-2 px-1">
                  <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-stone-400">Kekuatan Sandi:</span>
                    <span className={strength.score === 1 ? 'text-red-500' : strength.score === 2 ? 'text-amber-600' : 'text-emerald-600'}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'} flex-1`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'} flex-1`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'} flex-1`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="reg-confirm-password-input" className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5 ml-1">
                Ulangi Kata Sandi
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-stone-400 pointer-events-none">
                  <Lock size={18} />
                </div>
                <input 
                  id="reg-confirm-password-input"
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/15 outline-none transition-all text-sm font-medium text-stone-900 placeholder:text-stone-400"
                  placeholder="Ulangi kata sandi"
                  autoComplete="new-password"
                />
                {confirmPassword && password === confirmPassword && (
                  <div className="absolute right-4 text-emerald-600">
                    <Check size={18} />
                  </div>
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer mt-0.5"
                />
                <span className="leading-relaxed">
                  Saya menyetujui{' '}
                  <button 
                    type="button" 
                    onClick={() => router.push('/syarat-ketentuan')}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Syarat Layanan
                  </button>{' '}
                  dan{' '}
                  <button 
                    type="button" 
                    onClick={() => router.push('/kebijakan-privasi')}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    Kebijakan Privasi
                  </button>.
                </span>
              </label>
            </div>

            {/* Primary Action Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200/80 active:scale-[0.98] transition-all mt-2 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Atau daftar dengan
            </span>
          </div>

          {/* Secondary Actions: Social Buttons */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <button
              type="button"
              onClick={() => handleSocialRegister('Google')}
              disabled={isLoading}
              className="py-3 px-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialRegister('Apple')}
              disabled={isLoading}
              className="py-3 px-4 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-1.98.6-2.62 1.34-.57.65-1.06 1.71-.93 2.73 1.01.08 2.02-.51 2.63-1.23z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Login Navigation */}
          <div className="mt-8 text-center pt-5 border-t border-stone-100">
            <p className="text-stone-600 text-xs sm:text-sm">
              Sudah memiliki akun Bookly?{' '}
              <button 
                type="button"
                onClick={() => router.push('/login')} 
                className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline inline-flex items-center gap-1 transition-colors"
              >
                Masuk di sini
              </button>
            </p>
          </div>

          {/* Security Guarantee Badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Data Anda Disimpan Secara Aman & Terenkripsi</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

