export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'editor' | 'user' | 'guest';
export type BookStatus = 'draft' | 'published' | 'archived';
export type BookFormat = 'text' | 'pdf' | 'both';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'e_wallet' | 'qris' | 'manual';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          reading_preferences: Json;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          reading_preferences?: Json;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          reading_preferences?: Json;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          genre: string;
          category: string | null;
          description: string | null;
          synopsis: string | null;
          cover_url: string | null;
          pdf_url: string | null;
          content: string | null;
          format: BookFormat;
          status: BookStatus;
          year: number | null;
          isbn: string | null;
          publisher: string | null;
          pages: number | null;
          language: string | null;
          price: number;
          is_featured: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          genre: string;
          category?: string | null;
          description?: string | null;
          synopsis?: string | null;
          cover_url?: string | null;
          pdf_url?: string | null;
          content?: string | null;
          format?: BookFormat;
          status?: BookStatus;
          year?: number | null;
          isbn?: string | null;
          publisher?: string | null;
          pages?: number | null;
          language?: string | null;
          price?: number;
          is_featured?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          genre?: string;
          category?: string | null;
          description?: string | null;
          synopsis?: string | null;
          cover_url?: string | null;
          pdf_url?: string | null;
          content?: string | null;
          format?: BookFormat;
          status?: BookStatus;
          year?: number | null;
          isbn?: string | null;
          publisher?: string | null;
          pages?: number | null;
          language?: string | null;
          price?: number;
          is_featured?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          book_id: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          payment_method: PaymentMethod;
          transaction_reference: string;
          payment_gateway: string | null;
          gateway_response: Json | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id?: string | null;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method?: PaymentMethod;
          transaction_reference: string;
          payment_gateway?: string | null;
          gateway_response?: Json | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string | null;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method?: PaymentMethod;
          transaction_reference?: string;
          payment_gateway?: string | null;
          gateway_response?: Json | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_reading_progress: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          last_page: number;
          scroll_position: number;
          progress_percentage: number;
          is_completed: boolean;
          last_read_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          last_page?: number;
          scroll_position?: number;
          progress_percentage?: number;
          is_completed?: boolean;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          last_page?: number;
          scroll_position?: number;
          progress_percentage?: number;
          is_completed?: boolean;
          last_read_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          created_at?: string;
        };
      };
      book_reviews: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          rating?: number;
          review_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
