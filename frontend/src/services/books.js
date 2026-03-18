import { apiRequest } from './api';
import { fetchBookMetadataByTitleAuthor } from './googleBooks';

export function mapBookFromApi(book) {
  return {
    id: book.id,
    titulo: book.title || 'Sem titulo',
    autor: book.author || 'Autor não informado',
    genero: 'N/A',
    disponiveis: Number.isFinite(book.quantiteAvailable) ? book.quantiteAvailable : 0,
    sinopse: '',
    urlCapa: '',
  };
}

async function enrichBookWithGoogleData(book) {
  try {
    const metadata = await fetchBookMetadataByTitleAuthor(book.titulo, book.autor);
    if (!metadata) {
      return book;
    }

    return {
      ...book,
      ...metadata,
      genero: metadata.categorias || book.genero,
    };
  } catch {
    return book;
  }
}

async function enrichBooksSequentially(books) {
  const enriched = [];

  for (const book of books) {
    enriched.push(await enrichBookWithGoogleData(book));
  }

  return enriched;
}

export async function fetchBooksWithDetails() {
  const books = await apiRequest('/api/books');
  const details = await Promise.all(
    books.map(async (book) => {
      try {
        return await apiRequest(`/api/books/${book.id}`);
      } catch {
        return book;
      }
    })
  );
  return details.map(mapBookFromApi);
}

export async function fetchBookDetails(id) {
  const book = await apiRequest(`/api/books/${id}`);
  return mapBookFromApi(book);
}

export async function fetchBooksWithGoogleDetails() {
  const books = await fetchBooksWithDetails();
  return enrichBooksSequentially(books);
}

export async function fetchBookDetailsWithGoogle(id) {
  const book = await fetchBookDetails(id);
  return enrichBookWithGoogleData(book);
}
