import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold text-stone-900 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-stone-500 mb-6">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
