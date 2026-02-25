import { Book } from '@/types/book';

const BASE_URL = 'https://bukuacak-9bdcb4ef2605.herokuapp.com/api/v1/book';

export interface FetchBooksParams {
  sort?: string;
  page?: number;
  year?: string;
  genre?: string;
  keyword?: string;
}

export interface ApiResponse {
  books: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function fetchBooks(params: FetchBooksParams = {}): Promise<{ books: Book[], totalPages: number }> {
  const url = new URL(BASE_URL);
  
  if (params.sort) url.searchParams.append('sort', params.sort);
  if (params.page) url.searchParams.append('page', params.page.toString());
  if (params.year) url.searchParams.append('year', params.year);
  if (params.genre) url.searchParams.append('genre', params.genre);
  if (params.keyword) url.searchParams.append('keyword', params.keyword);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch books');
    
    const data: ApiResponse = await response.json();
    
    const brokenTitles = [
      "Harry Potter dan Si Anak Terkutuk: Naskah Drama Orisinal",
      "Focus on What Matters",
      "Satine",
      "Petualangan Sukab",
      "Mengelola Festival Film",
      "Belajar Kaya dari Teman SMA",
      "Pixar 1001 Stickers",
      "Princess 1001 Stickers",
      "The Third Door",
      "MARVEL SPIDEY AND HIS AMAZING FRIENDS: BERMAIN BAJAK LAUT - CERITA SERU DAN AKTIVITAS",
      "DISNEY FROZEN: PERMAINAN ES - CERITA SERU DAN AKTIVITAS",
      "Inside Out 2: Kepikiran (All in the Mind)",
      "The Character Gap",
      "Peta Sejarah Tiongkok"
    ];
    
    // Filter out books without a cover image or with known broken images
    const filteredBooks = data.books.filter((b: any) => {
      const hasCover = b.cover_image && b.cover_image.trim() !== "";
      const isNotBroken = !brokenTitles.includes(b.title);
      return hasCover && isNotBroken;
    });
    
    const mappedBooks: Book[] = filteredBooks.map((b: any) => {
      // Handle details being a string, array or object, and check nested data
      let details = b.details || b.detail || b.book_details || b.data?.details || b.data?.detail || {};
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch (e) {
          details = {};
        }
      }
      
      if (Array.isArray(details) && details.length > 0) {
        details = details[0];
      } else if (typeof details !== 'object' || details === null) {
        details = {};
      }
      
      // Helper to get value from multiple keys and nested objects
      const getVal = (keys: string[], obj1: any, obj2: any) => {
        for (const key of keys) {
          if (obj1[key] !== undefined && obj1[key] !== null && obj1[key] !== "") return obj1[key];
          if (obj2[key] !== undefined && obj2[key] !== null && obj2[key] !== "") return obj2[key];
        }
        return "";
      };

      // Try to find published date
      const rawDate = getVal(['published_date', 'release_date', 'year', 'published_at', 'date', 'publishedDate'], details, b);
      const yearMatch = String(rawDate).match(/\d{4}/);
      let year = yearMatch ? yearMatch[0] : "";
      
      // Try to find ISBN
      const rawIsbn = getVal(['isbn', 'isbn13', 'isbn10', 'isbn_13', 'isbn_10', 'ISBN'], details, b);
      let isbn = "";
      const isbnStr = String(rawIsbn).trim();
      // Filter out "0", "000...", "null", etc.
      if (isbnStr && !/^(0+|null|undefined|nan|n\/a|-)$/i.test(isbnStr)) {
        isbn = isbnStr.replace(/-/g, '');
      }
      
      // Try to find pages
      const rawPages = getVal(['number_of_pages', 'pages', 'page_count', 'total_pages', 'pageCount'], details, b);
      let pagesStr = "";
      const pStr = String(rawPages).trim();
      if (pStr && !/^(0+|null|undefined|nan|n\/a|-)$/i.test(pStr)) {
        pagesStr = pStr;
      }

      // Try to find publisher
      const publisher = String(getVal(['publisher', 'penerbit', 'published_by', 'Publisher'], details, b)).trim();
      
      // Try to find language
      const language = String(getVal(['language', 'bahasa', 'Language'], details, b)).trim();

      // Try to find dimensions
      const length = String(getVal(['length', 'panjang', 'book_length', 'Length'], details, b)).trim();
      const width = String(getVal(['width', 'lebar', 'book_width', 'Width'], details, b)).trim();

      const isJunk = (val: string) => {
        const s = val.toLowerCase();
        return s === "" || s === "null" || s === "undefined" || s === "-" || s === "n/a" || s === "nan";
      };

      let pdfUrl = undefined;
      if (b.title === "Jejak Balak") {
        pdfUrl = "https://jejak-balak-ayu-welirang-z-library-sk-1lib-sk-z-lib-sk.tiiny.site/Jejak-Balak-Ayu-Welirang-z-library-sk,-1lib-sk,-z-lib-sk.pdf";
      }

      return {
        id: b._id,
        title: b.title,
        author: b.author?.name || b.author || 'Unknown Author',
        cover: b.cover_image || 'https://picsum.photos/400/600',
        description: b.summary || b.description || 'No description available.',
        content: (b.summary || b.description || 'No content available.').replace(/WASPADA!AWASI/g, 'WASPADA! AWASI'),
        category: b.category?.name || b.category || 'Uncategorized',
        year: year,
        isbn: isbn,
        price: details.price || b.price || '',
        publisher: isJunk(publisher) ? "" : publisher,
        pages: pagesStr,
        language: isJunk(language) ? "" : language,
        length: isJunk(length) ? "" : length,
        width: isJunk(width) ? "" : width,
        pdfUrl: pdfUrl,
      };
    });

    return {
      books: mappedBooks,
      totalPages: data.pagination.totalPages
    };
  } catch (error) {
    console.error('Error fetching books:', error);
    return { books: [], totalPages: 0 };
  }
}
