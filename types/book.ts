export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  content: string; // Mock content or summary
  category: string;
  year?: string;
  isbn?: string;
  price?: string;
  publisher?: string;
  pages?: string;
  language?: string;
  length?: string;
  width?: string;
  pdfUrl?: string;
}

export interface UserState {
  bookmarks: string[]; // Book IDs
  downloads: Book[]; // Full Book objects for offline access
  lastRead: { [bookId: string]: number }; // Scroll position or page index
  lastReadBookId?: string; // ID of the most recently read book
  fontSize: number;
}
