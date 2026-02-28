export interface Book {
  id: string;
  judul: string;
  genre: string;
  category: string;
  cover: string;
  deskripsi: string;
  content?: string;
  title?: string;
  author?: string;
  year?: string;
  isbn?: string;
  publisher?: string;
  pages?: string;
  language?: string;
  length?: string;
  width?: string;
  pdfUrl?: string;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  date: string;
  username: string;
}

export interface UserState {
  bookmarks: string[]; // Book IDs
  downloads: Book[]; // Full Book objects for offline access
  lastRead: { [bookId: string]: number }; // Scroll position or page index
  lastReadBookId?: string; // ID of the most recently read book
  fontSize: number;
  username?: string;
  email?: string;
  reviews?: { [bookId: string]: Review[] };
}
