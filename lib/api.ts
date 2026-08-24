import { Book } from '@/types/book';

export interface FetchBooksParams {
  sort?: string;
  page?: number;
  limit?: number;
  year?: string;
  genre?: string;
  keyword?: string;
}

export interface FetchBooksResponse {
  books: Book[];
  totalPages: number;
  totalItems: number;
  totalCatalogCount: number;
  availableGenres: string[];
}

const LOCAL_STORAGE_CATALOG_KEY = 'bookly_admin_dynamic_books';

// Helper to get cached admin books from localStorage
export function getLocalAdminBooks(): Book[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse local admin books:', e);
    return [];
  }
}

// Helper to save admin books to localStorage
export function saveLocalAdminBooks(books: Book[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(books));
    window.dispatchEvent(new CustomEvent('bookly_catalog_updated'));
  } catch (e) {
    console.error('Failed to save local admin books:', e);
  }
}

export async function fetchBooks(params: FetchBooksParams = {}): Promise<FetchBooksResponse> {
  const query = new URLSearchParams();
  if (params.sort) query.append('sort', params.sort);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.year) query.append('year', params.year);
  if (params.genre) query.append('genre', params.genre);
  if (params.keyword) query.append('keyword', params.keyword);

  const endpoint = `/api/buku?${query.toString()}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const books = data.books || [];
    const totalPages = data.totalPages || 1;
    const totalItems = data.totalItems ?? books.length;
    const totalCatalogCount = data.totalCatalogCount ?? books.length;
    const availableGenres = data.availableGenres || [];

    // If server has 0 books but local storage has uploaded books, attempt sync
    if (totalCatalogCount === 0 && typeof window !== 'undefined') {
      const localBooks = getLocalAdminBooks();
      if (localBooks.length > 0) {
        // Sync to server silently
        syncCatalogToServer(localBooks).catch(() => {});
      }
    } else if (totalCatalogCount > 0 && typeof window !== 'undefined') {
      // Keep local store in sync
      if (!params.keyword && !params.genre && (!params.page || params.page === 1)) {
        // We can save the master list if we fetch all
      }
    }

    return {
      books,
      totalPages,
      totalItems,
      totalCatalogCount,
      availableGenres,
    };
  } catch (error) {
    console.error('Error fetching books from API:', error);
    // Offline fallback from localStorage
    const localBooks = getLocalAdminBooks();
    return {
      books: localBooks,
      totalPages: 1,
      totalItems: localBooks.length,
      totalCatalogCount: localBooks.length,
      availableGenres: Array.from(new Set(localBooks.map(b => b.genre || b.category).filter(Boolean))),
    };
  }
}

export async function createBook(bookData: Partial<Book>): Promise<{ success: boolean; book?: Book; error?: string }> {
  try {
    const response = await fetch('/api/buku', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create ebook');
    }

    // Update local cache
    if (data.book && typeof window !== 'undefined') {
      const current = getLocalAdminBooks();
      saveLocalAdminBooks([data.book, ...current.filter(b => b.id !== data.book.id)]);
    }

    return { success: true, book: data.book };
  } catch (error: any) {
    console.error('Error in createBook:', error);
    return { success: false, error: error?.message || 'Network error creating ebook' };
  }
}

export async function updateBook(bookData: Partial<Book> & { id: string }): Promise<{ success: boolean; book?: Book; error?: string }> {
  try {
    const response = await fetch('/api/buku', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to update ebook');
    }

    if (data.book && typeof window !== 'undefined') {
      const current = getLocalAdminBooks();
      saveLocalAdminBooks(current.map(b => (b.id === data.book.id ? data.book : b)));
    }

    return { success: true, book: data.book };
  } catch (error: any) {
    console.error('Error in updateBook:', error);
    return { success: false, error: error?.message || 'Network error updating ebook' };
  }
}

export async function deleteBook(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/buku?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete ebook');
    }

    if (typeof window !== 'undefined') {
      const current = getLocalAdminBooks();
      saveLocalAdminBooks(current.filter(b => b.id !== id));
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteBook:', error);
    return { success: false, error: error?.message || 'Network error deleting ebook' };
  }
}

export async function clearAllCatalog(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/buku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to clear catalog');
    }

    if (typeof window !== 'undefined') {
      saveLocalAdminBooks([]);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to clear catalog' };
  }
}

export async function syncCatalogToServer(books: Book[]): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/buku', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync', books }),
    });
    const data = await response.json();
    return { success: !!data.success };
  } catch (e) {
    return { success: false };
  }
}
