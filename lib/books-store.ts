import { Book } from '@/types/book';

// In-memory server store for dynamic books
// Starts empty by default so the home screen displays the "No books available yet" empty state
// Admin users can dynamically upload, edit, delete, and manage books in real time.

let dynamicBooks: Book[] = [];

export interface BookFilterParams {
  keyword?: string;
  genre?: string;
  sort?: string;
  year?: string;
  page?: number;
  limit?: number;
}

export function getDynamicBooks(params: BookFilterParams = {}) {
  const {
    keyword = '',
    genre = '',
    sort = '',
    year = '',
    page = 1,
    limit = 10,
  } = params;

  let filtered = [...dynamicBooks];

  // 1. Keyword search (title, author, genre, description, publisher, isbn)
  if (keyword.trim()) {
    const q = keyword.trim().toLowerCase();
    filtered = filtered.filter((b) => {
      const titleMatch = (b.judul || b.title || '').toLowerCase().includes(q);
      const authorMatch = (b.author || '').toLowerCase().includes(q);
      const genreMatch = (b.genre || b.category || '').toLowerCase().includes(q);
      const descMatch = (b.deskripsi || '').toLowerCase().includes(q);
      const pubMatch = (b.publisher || '').toLowerCase().includes(q);
      const isbnMatch = (b.isbn || '').toLowerCase().includes(q);
      return titleMatch || authorMatch || genreMatch || descMatch || pubMatch || isbnMatch;
    });
  }

  // 2. Genre / Category filtering
  if (genre && genre !== 'All' && genre !== 'All Genres') {
    const g = genre.toLowerCase();
    filtered = filtered.filter(
      (b) => (b.genre || '').toLowerCase() === g || (b.category || '').toLowerCase() === g
    );
  }

  // 3. Year filtering
  if (year && year.trim()) {
    filtered = filtered.filter((b) => String(b.year) === year.trim());
  }

  // 4. Sorting
  if (sort) {
    switch (sort) {
      case 'title_asc':
      case 'title-asc':
        filtered.sort((a, b) => (a.judul || a.title || '').localeCompare(b.judul || b.title || ''));
        break;
      case 'title_desc':
      case 'title-desc':
        filtered.sort((a, b) => (b.judul || b.title || '').localeCompare(a.judul || a.title || ''));
        break;
      case 'year_desc':
      case 'year-desc':
      case 'newest':
        filtered.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
        break;
      case 'year_asc':
      case 'year-asc':
      case 'oldest':
        filtered.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
        break;
      case 'author_asc':
        filtered.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
        break;
      case 'author_desc':
        filtered.sort((a, b) => (b.author || '').localeCompare(a.author || ''));
        break;
      default:
        break;
    }
  }

  const totalItems = filtered.length;
  const currentPage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startIndex = (currentPage - 1) * limit;
  const paginatedBooks = filtered.slice(startIndex, startIndex + limit);

  // Extract all distinct genres currently present in the dynamic catalog
  const availableGenres = Array.from(
    new Set(
      dynamicBooks
        .map((b) => b.genre || b.category)
        .filter((g): g is string => Boolean(g && g.trim()))
    )
  ).sort();

  return {
    books: paginatedBooks,
    totalItems,
    totalPages,
    currentPage,
    availableGenres,
    totalCatalogCount: dynamicBooks.length,
  };
}

export function getDynamicBookById(id: string): Book | undefined {
  return dynamicBooks.find((b) => b.id === id);
}

export interface CreateBookInput {
  judul: string;
  author: string;
  genre: string;
  category?: string;
  deskripsi: string;
  cover?: string;
  content?: string;
  pdfUrl?: string;
  year?: string;
  isbn?: string;
  publisher?: string;
  pages?: string;
  language?: string;
  length?: string;
  width?: string;
}

export function createDynamicBook(input: CreateBookInput): { success: boolean; book?: Book; error?: string } {
  const judul = (input.judul || '').trim();
  const author = (input.author || '').trim();
  const genre = (input.genre || input.category || 'General').trim();

  if (!judul) {
    return { success: false, error: 'Book title (judul) is required' };
  }
  if (!author) {
    return { success: false, error: 'Book author is required' };
  }

  const newId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const newBook: Book = {
    id: newId,
    judul,
    title: judul,
    author,
    genre,
    category: input.category || genre,
    deskripsi: (input.deskripsi || '').trim() || 'No description provided for this ebook.',
    cover: (input.cover || '').trim(),
    content: input.content || '',
    pdfUrl: input.pdfUrl || '',
    year: input.year ? String(input.year).trim() : new Date().getFullYear().toString(),
    isbn: input.isbn ? String(input.isbn).trim() : '',
    publisher: input.publisher ? String(input.publisher).trim() : 'Independent Publishing',
    pages: input.pages ? String(input.pages).trim() : '100',
    language: input.language ? String(input.language).trim() : 'Bahasa Indonesia',
    length: input.length ? String(input.length).trim() : '20 cm',
    width: input.width ? String(input.width).trim() : '14 cm',
  };

  // Prepend so newly uploaded books appear first
  dynamicBooks = [newBook, ...dynamicBooks];

  return { success: true, book: newBook };
}

export function updateDynamicBook(id: string, input: Partial<CreateBookInput>): { success: boolean; book?: Book; error?: string } {
  const index = dynamicBooks.findIndex((b) => b.id === id);
  if (index === -1) {
    return { success: false, error: `Book with id ${id} not found` };
  }

  const current = dynamicBooks[index];
  const updated: Book = {
    ...current,
    judul: input.judul !== undefined ? input.judul.trim() : current.judul,
    title: input.judul !== undefined ? input.judul.trim() : current.title,
    author: input.author !== undefined ? input.author.trim() : current.author,
    genre: input.genre !== undefined ? input.genre.trim() : current.genre,
    category: input.category !== undefined ? input.category.trim() : input.genre !== undefined ? input.genre.trim() : current.category,
    deskripsi: input.deskripsi !== undefined ? input.deskripsi.trim() : current.deskripsi,
    cover: input.cover !== undefined ? input.cover.trim() : current.cover,
    content: input.content !== undefined ? input.content : current.content,
    pdfUrl: input.pdfUrl !== undefined ? input.pdfUrl : current.pdfUrl,
    year: input.year !== undefined ? String(input.year).trim() : current.year,
    isbn: input.isbn !== undefined ? String(input.isbn).trim() : current.isbn,
    publisher: input.publisher !== undefined ? String(input.publisher).trim() : current.publisher,
    pages: input.pages !== undefined ? String(input.pages).trim() : current.pages,
    language: input.language !== undefined ? String(input.language).trim() : current.language,
    length: input.length !== undefined ? String(input.length).trim() : current.length,
    width: input.width !== undefined ? String(input.width).trim() : current.width,
  };

  dynamicBooks[index] = updated;
  return { success: true, book: updated };
}

export function deleteDynamicBook(id: string): { success: boolean; error?: string } {
  const initialLength = dynamicBooks.length;
  dynamicBooks = dynamicBooks.filter((b) => b.id !== id);
  if (dynamicBooks.length === initialLength) {
    return { success: false, error: `Book with id ${id} not found` };
  }
  return { success: true };
}

export function clearAllDynamicBooks(): { success: boolean; count: number } {
  const count = dynamicBooks.length;
  dynamicBooks = [];
  return { success: true, count };
}

export function syncClientBooks(books: Book[]): void {
  if (Array.isArray(books)) {
    dynamicBooks = [...books];
  }
}
