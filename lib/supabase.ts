import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseAdminClient: SupabaseClient<Database> | null = null;

/**
 * Returns the public / browser Supabase client (using anon key).
 * Utilizes lazy initialization to avoid module-load crashes when environment variables are unset.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // In development or preview where keys might not be entered yet, provide a mock-safe warning
      console.warn('Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set in environment.');
    }

    supabaseClient = createClient<Database>(
      supabaseUrl || 'https://placeholder-project.supabase.co',
      supabaseAnonKey || 'placeholder-anon-key',
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return supabaseClient;
}

/**
 * Returns the privileged Supabase client for Server-Side / API Route operations.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required for admin operations.');
    }

    supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminClient;
}

export const STORAGE_BUCKETS = {
  COVERS: 'book-covers',
  EBOOK_FILES: 'ebook-files',
} as const;
