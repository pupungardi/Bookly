import { Book } from '@/types/book';
import { getStoredUserState } from '@/lib/auth-storage';

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

/**
 * Get client auth headers based on currently stored user credentials
 */
export function getClientAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const userState = getStoredUserState();
    if (userState.token) {
      headers['Authorization'] = `Bearer ${userState.token}`;
    }
    if (userState.role) {
      headers['x-user-role'] = userState.role;
    }
  }

  return headers;
}

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
        syncCatalogToServer(localBooks).catch(() => {});
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

export async function createBook(bookData: Partial<Book>): Promise<{ success: boolean; book?: Book; error?: string; statusCode?: number }> {
  try {
    const authHeaders = getClientAuthHeaders();
    const response = await fetch('/api/buku', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(bookData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || (response.status === 403 
        ? 'Akses Ditolak (403): Anda tidak memiliki izin Administrator untuk mempublikasikan buku.' 
        : 'Gagal membuat ebook.');
      return { success: false, error: errorMsg, statusCode: response.status };
    }

    // Update local cache
    if (data.book && typeof window !== 'undefined') {
      const current = getLocalAdminBooks();
      saveLocalAdminBooks([data.book, ...current.filter(b => b.id !== data.book.id)]);
    }

    return { success: true, book: data.book, statusCode: 201 };
  } catch (error: any) {
    console.error('Error in createBook:', error);
    return { success: false, error: error?.message || 'Gagal terhubung ke server', statusCode: 500 };
  }
}

export async function updateBook(bookData: Partial<Book> & { id: string }): Promise<{ success: boolean; book?: Book; error?: string; statusCode?: number }> {
  try {
    const authHeaders = getClientAuthHeaders();
    const response = await fetch('/api/buku', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(bookData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || (response.status === 403 
        ? 'Akses Ditolak (403): Anda tidak memiliki izin Administrator untuk mengubah buku.' 
        : 'Gagal memperbarui ebook.');
      return { success: false, error: errorMsg, statusCode: response.status };
    }

    if (data.book && typeof window !== 'undefined') {
      const current = getLocalAdminBooks();
      saveLocalAdminBooks(current.map(b => (b.id === data.book.id ? data.book : b)));
    }

    return { success: true, book: data.book, statusCode: 200 };
  } catch (error: any) {
    console.error('Error in updateBook:', error);
    return { success: false, error: error?.message || 'Gagal terhubung ke server', statusCode: 500 };
  }
}

export async function deleteBook(id: string): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const authHeaders = getClientAuthHeaders();
    const response = await fetch(`/api/buku?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const errorMsg = data.error || (response.status === 403 
        ? 'Akses Ditolak (403): Anda tidak memiliki izin Administrator untuk menghapus buku.' 
        : 'Gagal menghapus ebook.');
      return { success: false, error: errorMsg, statusCode: response.status };
    }

    if (typeof window !== 'undefined') {
      const current = getLocalAdminBooks();
      saveLocalAdminBooks(current.filter(b => b.id !== id));
    }

    return { success: true, statusCode: 200 };
  } catch (error: any) {
    console.error('Error in deleteBook:', error);
    return { success: false, error: error?.message || 'Gagal terhubung ke server', statusCode: 500 };
  }
}

export async function clearAllCatalog(): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const authHeaders = getClientAuthHeaders();
    const response = await fetch('/api/buku', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ action: 'clear' }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      const errorMsg = data.error || (response.status === 403 
        ? 'Akses Ditolak (403): Anda tidak memiliki izin Administrator untuk menghapus seluruh katalog.' 
        : 'Gagal membersihkan katalog.');
      return { success: false, error: errorMsg, statusCode: response.status };
    }

    if (typeof window !== 'undefined') {
      saveLocalAdminBooks([]);
    }

    return { success: true, statusCode: 200 };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Gagal membersihkan katalog', statusCode: 500 };
  }
}

export async function syncCatalogToServer(books: Book[]): Promise<{ success: boolean; error?: string }> {
  try {
    const authHeaders = getClientAuthHeaders();
    const response = await fetch('/api/buku', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ action: 'sync', books }),
    });
    const data = await response.json();
    return { success: !!data.success, error: data.error };
  } catch (e: any) {
    return { success: false, error: e?.message };
  }
}
