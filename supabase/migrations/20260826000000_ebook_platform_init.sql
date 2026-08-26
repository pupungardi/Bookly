-- ============================================================================
-- Migration: 20260826000000_ebook_platform_init.sql
-- Supabase Schema & Storage Architecture for eBook Platform (Bookly)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'user', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.book_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.book_format AS ENUM ('text', 'pdf', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_method AS ENUM ('credit_card', 'bank_transfer', 'e_wallet', 'qris', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. UTILITY FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TABLES DEFINITION
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role public.user_role NOT NULL DEFAULT 'user',
    reading_preferences JSONB NOT NULL DEFAULT '{"fontSize": 16, "theme": "light", "lineSpacing": 1.6}'::jsonb,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    category TEXT,
    description TEXT,
    synopsis TEXT,
    cover_url TEXT,
    pdf_url TEXT,
    content TEXT,
    format public.book_format NOT NULL DEFAULT 'text',
    status public.book_status NOT NULL DEFAULT 'published',
    year INTEGER,
    isbn TEXT,
    publisher TEXT,
    pages INTEGER DEFAULT 1,
    language TEXT DEFAULT 'id',
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'IDR',
    status public.payment_status NOT NULL DEFAULT 'pending',
    payment_method public.payment_method NOT NULL DEFAULT 'qris',
    transaction_reference TEXT UNIQUE NOT NULL,
    payment_gateway TEXT DEFAULT 'midtrans',
    gateway_response JSONB DEFAULT '{}'::jsonb,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    last_page INTEGER NOT NULL DEFAULT 1,
    scroll_position NUMERIC(8, 2) NOT NULL DEFAULT 0,
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS public.book_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_books_status_created ON public.books(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_genre ON public.books(genre);
CREATE INDEX IF NOT EXISTS idx_books_year ON public.books(year);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_books_price ON public.books(price);
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON public.books USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON public.books USING gin (author gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_book_id ON public.payments(book_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_ref ON public.payments(transaction_reference);

CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON public.user_reading_progress(user_id, last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book ON public.book_reviews(book_id);

-- 6. TRIGGERS
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_books_updated_at ON public.books;
CREATE TRIGGER tr_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_payments_updated_at ON public.payments;
CREATE TRIGGER tr_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_reading_progress_updated_at ON public.user_reading_progress;
CREATE TRIGGER tr_reading_progress_updated_at BEFORE UPDATE ON public.user_reading_progress FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_reviews_updated_at ON public.book_reviews;
CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON public.book_reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. PROFILE SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = lookup_uid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = lookup_uid AND role IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_purchased_book(lookup_uid UUID, target_book_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.payments
        WHERE user_id = lookup_uid
          AND book_id = target_book_id
          AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- BOOKS
DROP POLICY IF EXISTS "Published books are viewable by everyone" ON public.books;
CREATE POLICY "Published books are viewable by everyone"
    ON public.books FOR SELECT
    USING (
        status = 'published' OR 
        public.is_admin_or_editor(auth.uid())
    );

DROP POLICY IF EXISTS "Admins and Editors can insert books" ON public.books;
CREATE POLICY "Admins and Editors can insert books"
    ON public.books FOR INSERT
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Admins and Editors can update books" ON public.books;
CREATE POLICY "Admins and Editors can update books"
    ON public.books FOR UPDATE
    USING (public.is_admin_or_editor(auth.uid()))
    WITH CHECK (public.is_admin_or_editor(auth.uid()));

DROP POLICY IF EXISTS "Only Admins can delete books" ON public.books;
CREATE POLICY "Only Admins can delete books"
    ON public.books FOR DELETE
    USING (public.is_admin(auth.uid()));

-- PAYMENTS
DROP POLICY IF EXISTS "Users can view their own payments, Admins view all" ON public.payments;
CREATE POLICY "Users can view their own payments, Admins view all"
    ON public.payments FOR SELECT
    USING (
        auth.uid() = user_id OR 
        public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Authenticated users can create pending payments for themselves" ON public.payments;
CREATE POLICY "Authenticated users can create pending payments for themselves"
    ON public.payments FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

DROP POLICY IF EXISTS "Only Admins or Service Role can update payment status" ON public.payments;
CREATE POLICY "Only Admins or Service Role can update payment status"
    ON public.payments FOR UPDATE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- PROGRESS & BOOKMARKS
DROP POLICY IF EXISTS "Users manage their own reading progress" ON public.user_reading_progress;
CREATE POLICY "Users manage their own reading progress"
    ON public.user_reading_progress FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage their own bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users manage their own bookmarks"
    ON public.user_bookmarks FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REVIEWS
DROP POLICY IF EXISTS "Book reviews are viewable by everyone" ON public.book_reviews;
CREATE POLICY "Book reviews are viewable by everyone"
    ON public.book_reviews FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can post reviews" ON public.book_reviews;
CREATE POLICY "Authenticated users can post reviews"
    ON public.book_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.book_reviews;
CREATE POLICY "Users can update their own reviews"
    ON public.book_reviews FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users or Admins can delete reviews" ON public.book_reviews;
CREATE POLICY "Users or Admins can delete reviews"
    ON public.book_reviews FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 10. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'book-covers', 
        'book-covers', 
        TRUE, 
        5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    ),
    (
        'ebook-files', 
        'ebook-files', 
        FALSE,
        104857600,
        ARRAY['application/pdf', 'text/plain', 'application/epub+zip', 'application/octet-stream']
    )
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 11. STORAGE RLS
DROP POLICY IF EXISTS "Book covers are publicly accessible" ON storage.objects;
CREATE POLICY "Book covers are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Admins and Editors can upload book covers" ON storage.objects;
CREATE POLICY "Admins and Editors can upload book covers"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'book-covers' AND
        public.is_admin_or_editor(auth.uid())
    );

DROP POLICY IF EXISTS "Admins and Editors can modify book covers" ON storage.objects;
CREATE POLICY "Admins and Editors can modify book covers"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'book-covers' AND
        public.is_admin_or_editor(auth.uid())
    );

DROP POLICY IF EXISTS "Admins can delete book covers" ON storage.objects;
CREATE POLICY "Admins can delete book covers"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'book-covers' AND
        public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Users can read free or purchased ebook files" ON storage.objects;
CREATE POLICY "Users can read free or purchased ebook files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'ebook-files' AND (
            public.is_admin_or_editor(auth.uid()) OR
            EXISTS (
                SELECT 1 FROM public.books b
                WHERE (b.pdf_url LIKE '%' || storage.objects.name OR b.id::text = split_part(storage.objects.name, '/', 1))
                  AND (b.price = 0 OR public.has_purchased_book(auth.uid(), b.id))
            )
        )
    );

DROP POLICY IF EXISTS "Admins and Editors can upload ebook files" ON storage.objects;
CREATE POLICY "Admins and Editors can upload ebook files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'ebook-files' AND
        public.is_admin_or_editor(auth.uid())
    );

DROP POLICY IF EXISTS "Admins and Editors can modify ebook files" ON storage.objects;
CREATE POLICY "Admins and Editors can modify ebook files"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'ebook-files' AND
        public.is_admin_or_editor(auth.uid())
    );

DROP POLICY IF EXISTS "Admins can delete ebook files" ON storage.objects;
CREATE POLICY "Admins can delete ebook files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'ebook-files' AND
        public.is_admin(auth.uid())
    );
