import { NextRequest, NextResponse } from 'next/server';
import {
  getDynamicBooks,
  createDynamicBook,
  updateDynamicBook,
  deleteDynamicBook,
  clearAllDynamicBooks,
  syncClientBooks,
  CreateBookInput,
} from '@/lib/books-store';
import { validateServerApiAuth } from '@/lib/rbac';

// GET: Fetch dynamic ebooks with filtering, search, pagination, and available genres
// PUBLIC ENDPOINT - All users & guests can browse the catalog
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pageStr = url.searchParams.get('page');
    const limitStr = url.searchParams.get('limit');
    const keyword = url.searchParams.get('keyword')?.trim() || '';
    const genre = url.searchParams.get('genre')?.trim() || '';
    const sort = url.searchParams.get('sort')?.trim() || '';
    const year = url.searchParams.get('year')?.trim() || '';

    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);

    const result = getDynamicBooks({
      keyword,
      genre,
      sort,
      year,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 10 : limit,
    });

    return NextResponse.json({
      success: true,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      totalCatalogCount: result.totalCatalogCount,
      availableGenres: result.availableGenres,
      books: result.books,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memuat daftar buku' },
      { status: 500 }
    );
  }
}

// POST: Admin endpoint to create, sync, or clear catalog
// PROTECTED ENDPOINT - Requires 'books:create' or 'books:manage' or 'admin:access'
export async function POST(request: NextRequest) {
  try {
    // 1. Server-Side RBAC Verification
    const authCheck = validateServerApiAuth(request, 'books:create');
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error || 'Akses Ditolak: Hak akses Administrator diperlukan.',
          code: 'UNAUTHORIZED_ACCESS',
        },
        { status: authCheck.statusCode }
      );
    }

    const body = await request.json();

    // Check for bulk sync or clear commands
    if (body.action === 'sync' && Array.isArray(body.books)) {
      const syncAuth = validateServerApiAuth(request, 'books:manage');
      if (!syncAuth.authorized) {
        return NextResponse.json(
          { success: false, error: syncAuth.error, code: 'FORBIDDEN' },
          { status: syncAuth.statusCode }
        );
      }

      syncClientBooks(body.books);
      return NextResponse.json({
        success: true,
        message: 'Katalog berhasil disinkronisasikan',
        count: body.books.length,
      });
    }

    if (body.action === 'clear') {
      const deleteAuth = validateServerApiAuth(request, 'books:delete');
      if (!deleteAuth.authorized) {
        return NextResponse.json(
          { success: false, error: deleteAuth.error, code: 'FORBIDDEN' },
          { status: deleteAuth.statusCode }
        );
      }

      const { count } = clearAllDynamicBooks();
      return NextResponse.json({
        success: true,
        message: `Berhasil membersihkan ${count} buku dari katalog dinamis`,
      });
    }

    // Input validation for book creation
    const input: CreateBookInput = {
      judul: body.judul || body.title,
      author: body.author,
      genre: body.genre || body.category || 'General',
      category: body.category || body.genre || 'General',
      deskripsi: body.deskripsi || body.description,
      cover: body.cover,
      content: body.content,
      pdfUrl: body.pdfUrl,
      year: body.year,
      isbn: body.isbn,
      publisher: body.publisher,
      pages: body.pages,
      language: body.language,
      length: body.length,
      width: body.width,
    };

    if (!input.judul || !input.judul.trim()) {
      return NextResponse.json(
        { success: false, error: 'Judul buku wajib diisi.' },
        { status: 400 }
      );
    }

    if (!input.author || !input.author.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nama penulis wajib diisi.' },
        { status: 400 }
      );
    }

    const result = createDynamicBook(input);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'eBook berhasil diunggah dan dipublikasikan!',
        book: result.book,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses permintaan' },
      { status: 500 }
    );
  }
}

// PUT: Admin endpoint to edit an existing eBook
// PROTECTED ENDPOINT - Requires 'books:edit' permission
export async function PUT(request: NextRequest) {
  try {
    // 1. Server-Side RBAC Verification
    const authCheck = validateServerApiAuth(request, 'books:edit');
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error || 'Akses Ditolak: Hak akses Administrator diperlukan untuk mengedit buku.',
          code: 'UNAUTHORIZED_ACCESS',
        },
        { status: authCheck.statusCode }
      );
    }

    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID Buku diperlukan untuk memperbarui data.' },
        { status: 400 }
      );
    }

    const result = updateDynamicBook(id, body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'eBook berhasil diperbarui',
      book: result.book,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memperbarui buku' },
      { status: 500 }
    );
  }
}

// DELETE: Admin endpoint to remove an eBook from the catalog
// PROTECTED ENDPOINT - Requires 'books:delete' permission
export async function DELETE(request: NextRequest) {
  try {
    // 1. Server-Side RBAC Verification
    const authCheck = validateServerApiAuth(request, 'books:delete');
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error || 'Akses Ditolak: Hak akses Administrator diperlukan untuk menghapus buku.',
          code: 'UNAUTHORIZED_ACCESS',
        },
        { status: authCheck.statusCode }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter ID buku diperlukan untuk penghapusan.' },
        { status: 400 }
      );
    }

    const result = deleteDynamicBook(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'eBook berhasil dihapus dari katalog',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal menghapus buku' },
      { status: 500 }
    );
  }
}
