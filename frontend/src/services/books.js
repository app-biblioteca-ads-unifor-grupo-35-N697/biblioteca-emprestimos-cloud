import { apiRequest } from './api';
import { fetchBookMetadataByTitleAuthor } from './googleBooks';

/**
 * Mapeia livro da API para formato consistente
 */
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

/**
 * Enriquece um livro com dados do Google Books
 * Com tratamento de erro para não quebrar o fluxo
 */
export async function enrichBookWithGoogleData(book) {
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
    // Retorna livro sem enriquecimento em caso de erro
    return book;
  }
}

/**
 * Enriquece múltiplos livros em paralelo com limite de concorrência
 * Evita sobrecarregar a API do Google Books
 */
export async function enrichBooksInParallel(books, limit = 5) {
  const results = [];
  
  for (let i = 0; i < books.length; i += limit) {
    const batch = books.slice(i, i + limit);
    const enrichedBatch = await Promise.all(
      batch.map(book => enrichBookWithGoogleData(book))
    );
    results.push(...enrichedBatch);
  }
  
  return results;
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

/**
 * Busca livros com detalhes enriquecidos do Google Books
 * OTIMIZADO: Enriquecimento em paralelo (limite de 5 requisições simultâneas)
 */
export async function fetchBooksWithGoogleDetails() {
  const books = await fetchBooksWithDetails();
  // Enriquece em paralelo em lotes de 5 para melhor performance
  return enrichBooksInParallel(books, 5);
}

/**
 * Busca detalhes de um livro com enriquecimento do Google
 */
export async function fetchBookDetailsWithGoogle(id) {
  const book = await fetchBookDetails(id);
  return enrichBookWithGoogleData(book);
}
