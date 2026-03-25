import { QueryClient } from '@tanstack/react-query';

/**
 * Configuração do React Query para cache e retry automático
 * 
 * Estratégia:
 * - Cache de 5 minutos para dados de livros
 * - Retry automático com backoff exponencial (3 tentativas)
 * - Garbage collection após 10 minutos sem uso
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: 5 minutos (300000ms)
      gcTime: 5 * 60 * 1000,
      
      // Stale time: 3 minutos (dados considerados "recentes" por 3 min)
      staleTime: 3 * 60 * 1000,
      
      // Retry automático com backoff exponencial
      retry: (failureCount, error) => {
        // Não fazer retry em erros 401 (não autorizado)
        if (error?.status === 401) {
          return false;
        }
        // Máximo 3 tentativas para outros erros
        return failureCount < 3;
      },
      
      // Delay entre retries: 1s, 2s, 4s (backoff exponencial)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Não refetch automaticamente em background
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
