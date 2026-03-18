/**
 * Serviço de integração com a API pública do Google Books
 * Responsável por buscar dados de livros por ISBN
 */

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/api/books';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 segundo entre tentativas
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos
const GOOGLE_COOLDOWN_MS = 60 * 1000; // 1 minuto sem tentar Google após estourar 429
const booksCache = new Map();
const metadataCache = new Map();
const inFlightRequests = new Map();
const inFlightMetadataRequests = new Map();
let googleRateLimitedUntil = 0;

function normalizeISBN(isbn) {
  return isbn.replace(/-/g, '').trim();
}

function getCachedBook(isbnNormalizado) {
  const cached = booksCache.get(isbnNormalizado);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    booksCache.delete(isbnNormalizado);
    return null;
  }

  return cached.data;
}

function setCachedBook(isbnNormalizado, dados) {
  booksCache.set(isbnNormalizado, {
    timestamp: Date.now(),
    data: dados,
  });
}

function getCachedMetadata(cacheKey) {
  const cached = metadataCache.get(cacheKey);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    metadataCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function setCachedMetadata(cacheKey, dados) {
  metadataCache.set(cacheKey, {
    timestamp: Date.now(),
    data: dados,
  });
}

/**
 * Aguarda um tempo especificado (para delay entre requisições)
 * @param {number} ms - Milissegundos para aguardar
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extrai os dados úteis da resposta da API do Google Books
 * @param {Object} bookData - Dados do livro retornados pela API
 * @returns {Object} Objeto com campos mapeados
 */
function mapGoogleBookData(bookData) {
  const volumeInfo = bookData.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};
  const rawCover = imageLinks.thumbnail || imageLinks.smallThumbnail || '';
  const httpsCover = rawCover.replace(/^http:\/\//i, 'https://');

  return {
    titulo: volumeInfo.title || '',
    autor: (volumeInfo.authors && volumeInfo.authors.join(', ')) || '',
    sinopse: volumeInfo.description || '',
    urlCapa: httpsCover,
    isbn: bookData.id || '',
  };
}

function mapOpenLibraryData(bookData, isbnNormalizado) {
  const description =
    typeof bookData.description === 'string'
      ? bookData.description
      : bookData.description?.value || '';

  return {
    titulo: bookData.title || '',
    autor: Array.isArray(bookData.authors)
      ? bookData.authors.map((author) => author?.name).filter(Boolean).join(', ')
      : '',
    sinopse: description,
    urlCapa: bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small || '',
    isbn: isbnNormalizado,
  };
}

function mapGoogleMetadataByVolumeInfo(volumeInfo = {}) {
  const imageLinks = volumeInfo.imageLinks || {};
  const rawCover =
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    imageLinks.medium ||
    imageLinks.large ||
    '';
  const httpsCover = rawCover.replace(/^http:\/\//i, 'https://');

  return {
    titulo: volumeInfo.title || '',
    autor: Array.isArray(volumeInfo.authors) ? volumeInfo.authors.join(', ') : '',
    sinopse: volumeInfo.description || '',
    urlCapa: httpsCover,
    categorias: Array.isArray(volumeInfo.categories)
      ? volumeInfo.categories.join(', ')
      : '',
  };
}

async function fetchGoogleMetadataByQuery(query, tentativa = 1) {
  const url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=1`;
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'BibliotecaEmprestimos/1.0 (educacional)',
  };

  const response = await fetch(url, { headers });

  if (response.status === 429) {
    if (tentativa < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, tentativa - 1);
      await sleep(delayMs);
      return fetchGoogleMetadataByQuery(query, tentativa + 1);
    }

    throw new Error('Muitas requisições para Google Books. Tente novamente em instantes.');
  }

  if (!response.ok) {
    throw new Error(`Erro ao conectar com Google Books: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return null;
  }

  return mapGoogleMetadataByVolumeInfo(data.items[0]?.volumeInfo || {});
}

async function fetchFromOpenLibrary(isbnLimpo, isbnNormalizado) {
  const url = `${OPEN_LIBRARY_API_URL}?bibkeys=ISBN:${encodeURIComponent(
    isbnLimpo
  )}&format=json&jscmd=data`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Erro ao conectar com Open Library: ${response.status}`);
  }

  const data = await response.json();
  const bookKey = `ISBN:${isbnLimpo}`;
  const openLibraryBook = data?.[bookKey];

  if (!openLibraryBook) {
    throw new Error(
      `Nenhum livro encontrado com ISBN: ${isbnLimpo}. Verifique o número e tente novamente.`
    );
  }

  const dadosMapeados = mapOpenLibraryData(openLibraryBook, isbnNormalizado);
  setCachedBook(isbnNormalizado, dadosMapeados);
  return dadosMapeados;
}

async function fetchBookByISBNInternal(isbnLimpo, isbnNormalizado, tentativa) {
  // Durante cooldown de 429, pula Google e vai direto ao fallback.
  if (Date.now() < googleRateLimitedUntil) {
    return fetchFromOpenLibrary(isbnLimpo, isbnNormalizado);
  }

  const url = `${GOOGLE_BOOKS_API_URL}?q=isbn:${encodeURIComponent(isbnLimpo)}`;
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'BibliotecaEmprestimos/1.0 (educacional)',
  };

  const response = await fetch(url, { headers });

  if (response.status === 429) {
    if (tentativa < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_MS * Math.pow(2, tentativa - 1);
      console.warn(
        `⏳ Erro 429 (rate limit). Tentativa ${tentativa + 1}/${MAX_RETRIES} em ${delayMs}ms...`
      );
      await sleep(delayMs);
      return fetchBookByISBNInternal(isbnLimpo, isbnNormalizado, tentativa + 1);
    }

    // Se estourou tentativas no Google, ativa cooldown e cai no fallback.
    googleRateLimitedUntil = Date.now() + GOOGLE_COOLDOWN_MS;
    return fetchFromOpenLibrary(isbnLimpo, isbnNormalizado);
  }

  if (!response.ok) {
    throw new Error(`Erro ao conectar com Google Books: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error(
      `Nenhum livro encontrado com ISBN: ${isbnLimpo}. Verifique o número e tente novamente.`
    );
  }

  const dadosMapeados = mapGoogleBookData(data.items[0]);
  setCachedBook(isbnNormalizado, dadosMapeados);
  return dadosMapeados;
}

/**
 * Busca um livro na API do Google Books pelo ISBN com retry automático
 * @param {string} isbn - Número do ISBN para buscar
 * @param {number} tentativa - Número da tentativa atual (interno)
 * @returns {Promise<Object>} Objeto com dados do livro mapeados
 * @throws {Error} Se o livro não for encontrado ou a API falhar
 */
export async function fetchBookByISBN(isbn, tentativa = 1) {
  if (!isbn || isbn.trim() === '') {
    throw new Error('ISBN é obrigatório');
  }

  const isbnLimpo = isbn.trim();
  const isbnNormalizado = normalizeISBN(isbnLimpo);
  const cached = getCachedBook(isbnNormalizado);

  if (cached) {
    return cached;
  }

  if (inFlightRequests.has(isbnNormalizado)) {
    return inFlightRequests.get(isbnNormalizado);
  }

  const requestPromise = (async () => {
    try {
      return await fetchBookByISBNInternal(isbnLimpo, isbnNormalizado, tentativa);
    } finally {
      inFlightRequests.delete(isbnNormalizado);
    }
  })();

  inFlightRequests.set(isbnNormalizado, requestPromise);

  try {
    return await requestPromise;
  } catch (error) {
    // Re-lança o erro se for nosso erro customizado
    if (
      error.message.includes('Nenhum livro encontrado') ||
      error.message.includes('ISBN é obrigatório') ||
      error.message.includes('Muitas requisições') ||
      error.message.includes('Erro ao conectar com Google Books') ||
      error.message.includes('Erro ao conectar com Open Library')
    ) {
      throw error;
    }

    // Caso seja erro de rede ou conexão
    if (error instanceof TypeError) {
      throw new Error(
        'Falha na conexão com Google Books. Verifique sua internet e tente novamente.'
      );
    }

    throw new Error(`Erro ao buscar livro: ${error.message}`);
  }
}

/**
 * Valida se um ISBN tem um formato básico válido
 * @param {string} isbn - ISBN para validar
 * @returns {boolean} True se o ISBN parece válido
 */
export function isValidISBN(isbn) {
  if (!isbn) return false;
  // ISBN-10: 10 dígitos, ISBN-13: 13 dígitos
  // Aceita com ou sem hífens
  const isbnSemHifens = isbn.replace(/-/g, '');
  return /^\d{10}(\d{3})?$/.test(isbnSemHifens);
}

export function clearGoogleBooksCache() {
  booksCache.clear();
  metadataCache.clear();
  inFlightRequests.clear();
  inFlightMetadataRequests.clear();
  googleRateLimitedUntil = 0;
}

export async function fetchBookMetadataByTitleAuthor(titulo, autor = '') {
  if (!titulo || !titulo.trim()) {
    return null;
  }

  const normalizedTitle = titulo.trim().toLowerCase();
  const normalizedAuthor = autor.trim().toLowerCase();
  const cacheKey = `meta:${normalizedTitle}|${normalizedAuthor}`;

  const cached = getCachedMetadata(cacheKey);
  if (cached) {
    return cached;
  }

  if (inFlightMetadataRequests.has(cacheKey)) {
    return inFlightMetadataRequests.get(cacheKey);
  }

  const firstAuthor = autor
    .split(',')[0]
    .replace(/\s+/g, ' ')
    .trim();

  const queryCandidates = [];

  if (firstAuthor) {
    queryCandidates.push(`intitle:${titulo.trim()} inauthor:${firstAuthor}`);
  }
  queryCandidates.push(`intitle:${titulo.trim()}`);
  queryCandidates.push(titulo.trim());

  const requestPromise = (async () => {
    try {
      let metadata = null;

      for (const query of queryCandidates) {
        metadata = await fetchGoogleMetadataByQuery(query);
        if (metadata?.urlCapa || metadata?.sinopse || metadata?.titulo) {
          break;
        }
      }

      if (metadata) {
        setCachedMetadata(cacheKey, metadata);
      }
      return metadata;
    } finally {
      inFlightMetadataRequests.delete(cacheKey);
    }
  })();

  inFlightMetadataRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
