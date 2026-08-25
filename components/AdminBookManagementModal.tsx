'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  BookPlus, 
  Database, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  Search, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  BookOpen, 
  RotateCcw,
  Tag,
  Calendar,
  Building,
  Hash,
  Globe,
  Sliders,
  RefreshCw,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound
} from 'lucide-react';
import Image from 'next/image';
import { Book, UserState } from '@/types/book';
import { createBook, updateBook, deleteBook, clearAllCatalog } from '@/lib/api';
import { getStoredUserState, switchUserRole } from '@/lib/auth-storage';
import { isAdmin, ROLE_METADATA } from '@/lib/rbac';

interface AdminBookManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogBooks: Book[];
  onCatalogChanged: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const COMMON_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Literature',
  'Technology',
  'Science',
  'History',
  'Philosophy',
  'Business',
  'Education',
  'Art & Design',
  'Poetry',
  'Culture',
];

export default function AdminBookManagementModal({
  isOpen,
  onClose,
  catalogBooks,
  onCatalogChanged,
  onShowToast,
}: AdminBookManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    judul: '',
    author: '',
    genre: 'Fiction',
    customGenre: '',
    deskripsi: '',
    coverType: 'upload' as 'upload' | 'url' | 'generated',
    coverUrl: '',
    coverBase64: '',
    contentType: 'text' as 'text' | 'pdf',
    content: '',
    pdfUrl: '',
    year: new Date().getFullYear().toString(),
    isbn: '',
    publisher: '',
    pages: '150',
    language: 'Bahasa Indonesia',
    length: '21 cm',
    width: '14 cm',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manageSearch, setManageSearch] = useState('');
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Reset form when opening in fresh upload mode
  const resetForm = () => {
    setFormData({
      judul: '',
      author: '',
      genre: 'Fiction',
      customGenre: '',
      deskripsi: '',
      coverType: 'upload',
      coverUrl: '',
      coverBase64: '',
      contentType: 'text',
      content: '',
      pdfUrl: '',
      year: new Date().getFullYear().toString(),
      isbn: '',
      publisher: '',
      pages: '150',
      language: 'Bahasa Indonesia',
      length: '21 cm',
      width: '14 cm',
    });
    setEditingBookId(null);
    setFormErrors({});
  };

  // Populate form when clicking edit on a book
  const startEditBook = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      judul: book.judul || book.title || '',
      author: book.author || '',
      genre: COMMON_GENRES.includes(book.genre) ? book.genre : 'Custom',
      customGenre: COMMON_GENRES.includes(book.genre) ? '' : book.genre,
      deskripsi: book.deskripsi || '',
      coverType: book.cover?.startsWith('data:') ? 'upload' : book.cover ? 'url' : 'generated',
      coverUrl: book.cover?.startsWith('data:') ? '' : book.cover || '',
      coverBase64: book.cover?.startsWith('data:') ? book.cover : '',
      contentType: book.pdfUrl ? 'pdf' : 'text',
      content: book.content || '',
      pdfUrl: book.pdfUrl || '',
      year: book.year || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      pages: book.pages || '',
      language: book.language || 'Bahasa Indonesia',
      length: book.length || '21 cm',
      width: book.width || '14 cm',
    });
    setActiveTab('upload');
    setFormErrors({});
  };

  // Handle Cover Image File Upload (Converts to Data URL)
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (PNG, JPG, WebP).', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      onShowToast('Image size exceeds 4MB. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({
        ...prev,
        coverBase64: result,
        coverType: 'upload',
      }));
      onShowToast('Cover image loaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle PDF File Upload (Converts to Data URL or Object URL)
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      onShowToast('Please select a valid PDF file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({
        ...prev,
        pdfUrl: result,
        contentType: 'pdf',
      }));
      onShowToast(`PDF "${file.name}" loaded for reader!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Generate Sample Text Content
  const handleInsertSampleText = () => {
    const sample = `BAB 1: LANGKAH PERTAMA\n\nSetiap perjalanan besar dimulai dengan tekad yang bulat di dalam keheningan pikiran. Ketika matahari terbit di ufuk timur, cakrawala membentang dengan jutaan kemungkinan baru.\n\nDalam dunia digital saat ini, kemampuan untuk belajar dan beradaptasi adalah aset paling berharga. Pengetahuan bukan lagi sekadar informasi yang dihafal, melainkan pemahaman yang diwujudkan dalam karya nyata.\n\nBAB 2: MENEMUKAN FOKUS\n\nDi tengah hiruk pikuk notifikasi dan distraksi tak berkesudahan, ketenangan batin menjadi sebuah kemewahan yang langka. Mereka yang mampu mengendalikan atensi dan mengarahkannya pada tujuan bermakna akan melangkah jauh melampaui rata-rata.\n\n"Fokus bukan berarti mengatakan ya pada hal yang ingin kamu kerjakan, melainkan mengatakan tidak pada ratusan ide bagus lainnya yang mengalihkan perhatianmu."\n\nBAB 3: KARYA ABADI\n\nMenulis dan membaca adalah dialog abadi lintas ruang dan waktu. Melalui lembaran-lembaran ini, gagasan terus hidup dan menginspirasi generasi masa depan.`;
    setFormData(prev => ({ ...prev, content: sample }));
    onShowToast('Sample chapter text inserted.', 'info');
  };

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.judul.trim()) {
      errors.judul = 'Book title is required.';
    }

    if (!formData.author.trim()) {
      errors.author = 'Author name is required.';
    }

    if (formData.genre === 'Custom' && !formData.customGenre.trim()) {
      errors.customGenre = 'Please specify custom genre name.';
    }

    if (formData.contentType === 'text' && !formData.content.trim()) {
      errors.content = 'Please enter readable text content or insert sample chapters.';
    }

    if (formData.contentType === 'pdf' && !formData.pdfUrl.trim()) {
      errors.pdfUrl = 'Please upload a PDF file or provide a valid PDF link.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Form Submit (Upload / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      onShowToast('Please fill all required fields correctly.', 'error');
      return;
    }

    setIsSubmitting(true);

    const resolvedGenre = formData.genre === 'Custom' ? formData.customGenre.trim() : formData.genre;
    
    // Resolve final cover URL/Base64
    let finalCover = '';
    if (formData.coverType === 'upload' && formData.coverBase64) {
      finalCover = formData.coverBase64;
    } else if (formData.coverType === 'url' && formData.coverUrl.trim()) {
      finalCover = formData.coverUrl.trim();
    } else if (formData.coverType === 'generated' || (!formData.coverBase64 && !formData.coverUrl)) {
      // Empty cover triggers typographic clean cover
      finalCover = '';
    }

    const payload = {
      judul: formData.judul.trim(),
      author: formData.author.trim(),
      genre: resolvedGenre || 'General',
      category: resolvedGenre || 'General',
      deskripsi: formData.deskripsi.trim() || 'No description provided.',
      cover: finalCover,
      content: formData.contentType === 'text' ? formData.content : '',
      pdfUrl: formData.contentType === 'pdf' ? formData.pdfUrl : '',
      year: formData.year.trim() || new Date().getFullYear().toString(),
      isbn: formData.isbn.trim(),
      publisher: formData.publisher.trim() || 'Independent Publishing',
      pages: formData.pages.trim() || '120',
      language: formData.language.trim() || 'Bahasa Indonesia',
      length: formData.length.trim() || '21 cm',
      width: formData.width.trim() || '14 cm',
    };

    if (editingBookId) {
      // Update
      const res = await updateBook({ ...payload, id: editingBookId });
      setIsSubmitting(false);

      if (res.success) {
        onShowToast(`eBook "${payload.judul}" updated successfully!`, 'success');
        resetForm();
        onCatalogChanged();
        setActiveTab('manage');
      } else {
        onShowToast(res.error || 'Failed to update eBook', 'error');
      }
    } else {
      // Create New
      const res = await createBook(payload);
      setIsSubmitting(false);

      if (res.success) {
        onShowToast(`eBook "${payload.judul}" published to catalog!`, 'success');
        resetForm();
        onCatalogChanged();
        setActiveTab('manage');
      } else {
        onShowToast(res.error || 'Failed to upload eBook', 'error');
      }
    }
  };

  // Handle Delete Confirmation
  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);

    const res = await deleteBook(bookToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      onShowToast(`eBook "${bookToDelete.judul}" deleted from catalog.`, 'info');
      setBookToDelete(null);
      onCatalogChanged();
    } else {
      onShowToast(res.error || 'Failed to delete eBook', 'error');
    }
  };

  // Quick Seed Sample Starter eBook
  const handleQuickSeedStarter = async () => {
    setIsSubmitting(true);
    const starterBook = {
      judul: 'Arsitektur Masa Depan: Desain Digital & Keberlanjutan',
      author: 'Arya Wicaksono',
      genre: 'Technology',
      category: 'Technology',
      deskripsi: 'Eksplorasi mendalam tentang integrasi kecerdasan buatan, komputasi awan, dan arsitektur ramah lingkungan dalam membangun peradaban kota pintar modern.',
      cover: '',
      content: `BAB 1: EVOLUSI ARSITEKTUR DIGITAL\n\nPeradaban manusia selalu didefinisikan oleh material yang mereka gunakan untuk membangun tempat bernaung. Dari batu, kayu, baja, hingga kini: data dan algoritma cerdas.\n\nKetika struktur fisik bertemu dengan sensor Internet of Things (IoT), bangunan bukan lagi sekadar benda mati. Mereka beradaptasi dengan ritme kehidupan penghuninya, mengoptimalkan konsumsi energi secara otonom, dan merespons perubahan iklim mikro di sekitarnya.\n\nBAB 2: SIMBIOSIS MANUSIA DAN KECERDASAN BUATAN\n\nDesain masa depan bukanlah tentang menggantikan sentuhan manusia, melainkan memperkuat intuisi kreatif melalui visualisasi generatif. Arsitek modern bertindak sebagai konduktor orkestra teknologi yang menjaga keseimbangan antara estetika, fungsionalitas, dan kelestarian biosfer bumi.`,
      year: '2026',
      isbn: '9786029981201',
      publisher: 'Penerbit Cipta Digital',
      pages: '240',
      language: 'Bahasa Indonesia',
      length: '23 cm',
      width: '15 cm',
    };

    const res = await createBook(starterBook);
    setIsSubmitting(false);
    if (res.success) {
      onShowToast('Sample modern eBook added to catalog!', 'success');
      onCatalogChanged();
      setActiveTab('manage');
    }
  };

  // Clear entire catalog
  const handleClearAllCatalog = async () => {
    if (!window.confirm('Are you sure you want to clear all books from the catalog? This will return the home screen to the empty state.')) {
      return;
    }
    const res = await clearAllCatalog();
    if (res.success) {
      onShowToast('Catalog cleared! Home screen is now in clean empty state.', 'info');
      onCatalogChanged();
    }
  };

  const filteredManageBooks = catalogBooks.filter(b => {
    const q = manageSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.judul || b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.genre || '').toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  const currentUserState = getStoredUserState();
  const hasAdminPrivilege = isAdmin(currentUserState);

  if (!hasAdminPrivilege) {
    const currentRole = currentUserState.role || 'user';
    const roleMeta = ROLE_METADATA[currentRole];

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-200 text-center"
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <span className="inline-block px-3 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200 mb-2 font-mono">
              403 FORBIDDEN
            </span>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              Panel Manajemen eBook memerlukan hak akses <strong>Administrator</strong>. Peran Anda saat ini adalah <span className={`px-2 py-0.5 rounded font-bold ${roleMeta.badgeClass}`}>{roleMeta.name}</span>.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  switchUserRole('admin');
                  onShowToast('Peran berhasil diubah menjadi Administrator (Akses Diberikan).', 'success');
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound size={14} />
                <span>Beralih ke Akun Administrator</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-900/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[2rem] shadow-2xl border border-stone-200 flex flex-col overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                <Database size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-serif font-bold text-stone-900 flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <span className="truncate">Admin eBook Management Studio</span>
                  <span className="text-[11px] font-sans font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    CMS Active
                  </span>
                </h2>
                <p className="text-xs text-stone-500 truncate sm:whitespace-normal">Upload, publish, and manage eBooks dynamically for real-time catalog display</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6 border-b border-stone-200 flex items-center justify-between gap-2 bg-white overflow-x-auto no-scrollbar">
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('upload');
                  if (!editingBookId) resetForm();
                }}
                className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {editingBookId ? <Edit3 size={16} className="shrink-0" /> : <BookPlus size={16} className="shrink-0" />}
                <span className="whitespace-nowrap">{editingBookId ? 'Edit eBook Details' : 'Upload & Publish eBook'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`py-3.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'manage'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers size={16} className="shrink-0" />
                <span className="whitespace-nowrap">Manage Catalog ({catalogBooks.length})</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuickSeedStarter}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                title="Add a sample modern eBook to test reading"
              >
                <Sparkles size={13} className="shrink-0" />
                <span className="whitespace-nowrap">Add Sample Book</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'upload' ? (
              /* TAB 1: UPLOAD / EDIT FORM */
              <form onSubmit={handleSubmit} className="space-y-6">
                {editingBookId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
                      <Edit3 size={14} />
                      <span>Editing: <strong>{formData.judul}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-amber-900 font-bold hover:underline"
                    >
                      Cancel Edit &amp; Create New
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Core Details */}
                  <div className="space-y-4">
                    {/* Judul / Title */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Book Title (Judul Buku) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.judul}
                        onChange={e => setFormData({ ...formData, judul: e.target.value })}
                        placeholder="e.g., Filosofi Masa Depan &amp; Teknologi"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 outline-none transition-all ${
                          formErrors.judul ? 'border-red-400 bg-red-50/50' : 'border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                        }`}
                      />
                      {formErrors.judul && <p className="text-red-500 text-[11px] mt-1">{formErrors.judul}</p>}
                    </div>

                    {/* Author / Penulis */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Author Name (Penulis) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                        placeholder="e.g., Prof. Dr. Satria Nugraha"
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 outline-none transition-all ${
                          formErrors.author ? 'border-red-400 bg-red-50/50' : 'border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                        }`}
                      />
                      {formErrors.author && <p className="text-red-500 text-[11px] mt-1">{formErrors.author}</p>}
                    </div>

                    {/* Genre / Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Category / Genre</label>
                        <select
                          value={formData.genre}
                          onChange={e => setFormData({ ...formData, genre: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white outline-none focus:border-emerald-500"
                        >
                          {COMMON_GENRES.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                          <option value="Custom">+ Custom Category</option>
                        </select>
                      </div>

                      {formData.genre === 'Custom' && (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">Custom Category Name</label>
                          <input
                            type="text"
                            value={formData.customGenre}
                            onChange={e => setFormData({ ...formData, customGenre: e.target.value })}
                            placeholder="e.g., Neuroscience"
                            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Description / Synopsis */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Synopsis / Description</label>
                      <textarea
                        rows={4}
                        value={formData.deskripsi}
                        onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                        placeholder="Write a compelling summary of the eBook..."
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Right Column: Cover & Format Handling */}
                  <div className="space-y-4">
                    {/* Cover Section */}
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <ImageIcon size={15} className="text-emerald-600 shrink-0" />
                          <span className="whitespace-nowrap">Book Cover Image</span>
                        </label>
                        <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-stone-200/70 p-0.5 rounded-lg text-[11px] shrink-0">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, coverType: 'upload' })}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                              formData.coverType === 'upload' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, coverType: 'url' })}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                              formData.coverType === 'url' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Image URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, coverType: 'generated', coverBase64: '', coverUrl: '' })}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                              formData.coverType === 'generated' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Typographic
                          </button>
                        </div>
                      </div>

                      {formData.coverType === 'upload' && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverFileUpload}
                            className="hidden"
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white group"
                          >
                            {formData.coverBase64 ? (
                              <div className="flex items-center justify-center gap-4">
                                <div className="relative w-16 h-22 rounded-lg overflow-hidden shadow-md border border-stone-200 shrink-0">
                                  <Image
                                    src={formData.coverBase64}
                                    alt="Cover preview"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold text-stone-800">Custom Image Loaded</p>
                                  <p className="text-[11px] text-stone-400 mt-0.5">Click to choose a different image</p>
                                </div>
                              </div>
                            ) : (
                              <div className="py-2">
                                <Upload size={22} className="mx-auto text-stone-400 group-hover:text-emerald-600 transition-colors mb-1.5" />
                                <p className="text-xs font-bold text-stone-700">Click to upload cover image</p>
                                <p className="text-[11px] text-stone-400 mt-0.5">PNG, JPG, WebP up to 4MB</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {formData.coverType === 'url' && (
                        <div>
                          <input
                            type="url"
                            value={formData.coverUrl}
                            onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                            placeholder="https://example.com/cover.jpg"
                            className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white outline-none focus:border-emerald-500"
                          />
                          {formData.coverUrl && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="relative w-10 h-14 rounded overflow-hidden border border-stone-200 shrink-0">
                                <Image
                                  src={formData.coverUrl}
                                  alt="Cover preview"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <span className="text-[11px] text-emerald-700 font-semibold whitespace-nowrap">Image URL Preview Active</span>
                            </div>
                          )}
                        </div>
                      )}

                      {formData.coverType === 'generated' && (
                        <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                          <p className="text-xs font-bold text-stone-800">Dynamic Geometric Typographic Cover</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            A clean, modern typographic card will be automatically generated with title and author name.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* eBook Content / Reader Format Section */}
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <FileText size={15} className="text-blue-600 shrink-0" />
                          <span className="whitespace-nowrap">eBook Format &amp; Content</span>
                        </label>
                        <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-stone-200/70 p-0.5 rounded-lg text-[11px] shrink-0">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, contentType: 'text' })}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                              formData.contentType === 'text' ? 'bg-white text-blue-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            Chapter Text
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, contentType: 'pdf' })}
                            className={`px-2.5 py-1 rounded-md font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                              formData.contentType === 'pdf' ? 'bg-white text-blue-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            PDF Document
                          </button>
                        </div>
                      </div>

                      {formData.contentType === 'text' ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-stone-500">Reader will display formatted chapter text</span>
                            <button
                              type="button"
                              onClick={handleInsertSampleText}
                              className="text-[11px] text-emerald-700 font-bold hover:underline"
                            >
                              Insert Sample Text
                            </button>
                          </div>
                          <textarea
                            rows={4}
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="BAB 1: JUDUL BAB&#10;&#10;Tulis isi buku atau teks bab di sini..."
                            className={`w-full px-3 py-2 rounded-xl border text-xs text-stone-900 bg-white font-mono outline-none ${
                              formErrors.content ? 'border-red-400' : 'border-stone-200 focus:border-emerald-500'
                            }`}
                          />
                          {formErrors.content && <p className="text-red-500 text-[11px]">{formErrors.content}</p>}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            ref={pdfInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfFileUpload}
                            className="hidden"
                          />
                          <div
                            onClick={() => pdfInputRef.current?.click()}
                            className="border-2 border-dashed border-stone-300 hover:border-blue-500 rounded-xl p-3 text-center cursor-pointer bg-white transition-colors"
                          >
                            <FileText size={20} className="mx-auto text-stone-400 mb-1" />
                            <p className="text-xs font-bold text-stone-700">Click to upload PDF Document</p>
                            <p className="text-[11px] text-stone-400">Supports offline and interactive reader</p>
                          </div>
                          {formData.pdfUrl && (
                            <p className="text-[11px] text-blue-700 font-bold">PDF file attached and ready for reader.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Metadata Accordion */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSpecs(!showAdvancedSpecs)}
                    className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sliders size={14} className="text-stone-500" />
                      <span>Detailed Publication Specifications (Optional)</span>
                    </span>
                    <span className="text-stone-400">{showAdvancedSpecs ? 'Hide' : 'Show'}</span>
                  </button>

                  {showAdvancedSpecs && (
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border-t border-stone-100">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Year (Tahun)</label>
                        <input
                          type="text"
                          value={formData.year}
                          onChange={e => setFormData({ ...formData, year: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">ISBN</label>
                        <input
                          type="text"
                          value={formData.isbn}
                          onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                          placeholder="978-..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Publisher</label>
                        <input
                          type="text"
                          value={formData.publisher}
                          onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                          placeholder="Pustaka..."
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">Pages (Halaman)</label>
                        <input
                          type="text"
                          value={formData.pages}
                          onChange={e => setFormData({ ...formData, pages: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 font-bold text-xs transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>{editingBookId ? 'Save Changes' : 'Publish to Catalog'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: MANAGE CATALOG */
              <div className="space-y-4">
                {/* Search and stats bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={manageSearch}
                      onChange={e => setManageSearch(e.target.value)}
                      placeholder="Search uploaded books..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-900 bg-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveTab('upload');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add New</span>
                    </button>

                    {catalogBooks.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllCatalog}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Clear All</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Catalog Listing */}
                {filteredManageBooks.length === 0 ? (
                  <div className="py-16 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-6">
                    <BookOpen size={36} className="mx-auto text-stone-400 mb-2" />
                    <h4 className="text-sm font-bold text-stone-800">No books found in catalog</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                      {manageSearch ? 'No matches for your search term.' : 'Click "+ Add New" or use "Add Sample Book" to populate your catalog.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredManageBooks.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-300 transition-all flex items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-12 h-16 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden relative shrink-0 flex items-center justify-center text-stone-400 font-bold text-xs">
                            {b.cover ? (
                              <Image
                                src={b.cover}
                                alt={b.judul}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded text-center leading-tight">
                                {b.judul.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-stone-900 truncate">{b.judul || b.title}</h4>
                            <p className="text-xs text-stone-500 truncate mt-0.5">by {b.author}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                                {b.genre}
                              </span>
                              {b.pdfUrl ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                                  PDF
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                                  Text
                                </span>
                              )}
                              {b.year && (
                                <span className="text-[10px] text-stone-400">{b.year}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditBook(b)}
                            className="p-2 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit eBook"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBookToDelete(b)}
                            className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete eBook"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {bookToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-2">Delete eBook?</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-6">
                  Are you sure you want to delete <span className="font-bold text-stone-900">&quot;{bookToDelete.judul}&quot;</span>? This action removes it immediately from the public catalog.
                </p>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBookToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteBook}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-200 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete eBook'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
