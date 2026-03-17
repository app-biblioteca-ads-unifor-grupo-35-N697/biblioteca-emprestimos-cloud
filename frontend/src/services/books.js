import { apiRequest } from './api';

export function mapBookFromApi(book) {
  return {
    id: book.id,
    titulo: book.title || 'Sem titulo',
    autor: book.author || 'Autor não informado',
    genero: 'N/A',
    disponiveis: Number.isFinite(book.quantiteAvailable) ? book.quantiteAvailable : 0,
  };
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
