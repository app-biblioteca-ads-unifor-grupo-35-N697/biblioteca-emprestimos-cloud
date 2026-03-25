import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { 
  fetchBooksWithDetails, 
  enrichBooksInParallel,
  fetchBookDetails,
} from './books';
import { fetchBookMetadataByTitleAuthor } from './googleBooks';

/**
 * Hook para buscar todos os livros com enriquecimento (com cache)
 */
export function useBooksWithGoogle() {
  return useQuery({
    queryKey: ['books', 'google'],
    queryFn: async () => {
      const books = await fetchBooksWithDetails();
      // Enriquece em paralelo (limite de 5)
      return enrichBooksInParallel(books, 5);
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar livros com paginação
 */
export function useBooksWithGooglePaginated(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ['books', 'google', 'paginated', page, pageSize],
    queryFn: async () => {
      const books = await fetchBooksWithDetails();
      const enriched = await enrichBooksInParallel(books, 5);
      
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      
      return {
        data: enriched.slice(startIdx, endIdx),
        total: enriched.length,
        page,
        pageSize,
        hasMore: endIdx < enriched.length,
      };
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar um livro específico com detalhes
 */
export function useBookWithGoogle(bookId) {
  return useQuery({
    queryKey: ['book', bookId, 'google'],
    queryFn: async () => {
      const book = await fetchBookDetails(bookId);
      const metadata = await fetchBookMetadataByTitleAuthor(book.titulo, book.autor);
      return {
        ...book,
        ...metadata,
        genero: metadata?.categorias || book.genero,
      };
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para fazer empréstimo de livro
 */
export function useBorrowBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId) => {
      return apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify({ bookId }),
      });
    },
    onSuccess: () => {
      // Invalida cache de livros após empréstimo bem-sucedido
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

/**
 * Hook para buscar empréstimos do usuário
 */
export function useUserLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      return apiRequest('/api/loans');
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar todos os usuários (admin)
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      return apiRequest('/api/users');
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar todos os livros sem enriquecimento (mais rápido)
 */
export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      return fetchBooksWithDetails();
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para fazer login
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (credentials) => {
      return apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
  });
}

/**
 * Hook para fazer cadastro
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (userData) => {
      return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
  });
}

/**
 * Hook para devolver livro
 */
export function useReturnBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (loanId) => {
      return apiRequest(`/api/loans/${loanId}/return`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

/**
 * Hook para deletar livro (admin)
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId) => {
      return apiRequest(`/api/books/${bookId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

/**
 * Hook para criar/atualizar livro (admin)
 */
export function useSaveBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/books/${id}` : '/api/books';
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
