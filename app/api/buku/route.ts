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

// GET: Fetch dynamic ebooks with filtering, search, pagination, and available genres
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
      { success: false, error: error?.message || 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST: Admin endpoint to create and publish a new eBook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check for bulk sync or clear commands
    if (body.action === 'sync' && Array.isArray(body.books)) {
      syncClientBooks(body.books);
      return NextResponse.json({
        success: true,
        message: 'Catalog synchronized successfully',
        count: body.books.length,
      });
    }

    if (body.action === 'clear') {
      const { count } = clearAllDynamicBooks();
      return NextResponse.json({
        success: true,
        message: `Cleared all ${count} books from the dynamic catalog`,
      });
    }

    // Input validation
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
        { success: false, error: 'Book title (Judul Buku) is required.' },
        { status: 400 }
      );
    }

    if (!input.author || !input.author.trim()) {
      return NextResponse.json(
        { success: false, error: 'Author name (Penulis) is required.' },
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
        message: 'eBook uploaded and published successfully!',
        book: result.book,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT: Admin endpoint to edit an existing eBook
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Book ID is required for updating.' },
        { status: 400 }
      );
    }

    const result = updateDynamicBook(id, body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'eBook updated successfully',
      book: result.book,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE: Admin endpoint to remove an eBook from the catalog
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Book ID parameter is required for deletion.' },
        { status: 400 }
      );
    }

    const result = deleteDynamicBook(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'eBook removed from catalog',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete book' },
      { status: 500 }
    );
  }
}
