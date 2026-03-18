import {
  fetchBookByISBN,
  isValidISBN,
  clearGoogleBooksCache,
} from './googleBooks';

/**
 * Testes unitários para o serviço de integração com Google Books API
 */
describe('googleBooks.js - Serviço Google Books API', () => {
  const sampleResponse = {
    items: [
      {
        id: '9780134685991',
        volumeInfo: {
          title: 'Clean Code',
          authors: ['Robert C. Martin'],
          description: 'A handbook of agile software craftsmanship',
          imageLinks: {
            thumbnail: 'http://example.com/cover.jpg',
            smallThumbnail: 'http://example.com/small.jpg',
          },
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    clearGoogleBooksCache();
  });

  describe('isValidISBN()', () => {
    it('valida ISBN-13 e ISBN-10', () => {
      expect(isValidISBN('9780134685991')).toBe(true);
      expect(isValidISBN('0134685997')).toBe(true);
      expect(isValidISBN('978-0-134-68599-1')).toBe(true);
    });

    it('rejeita ISBN inválido', () => {
      expect(isValidISBN('')).toBe(false);
      expect(isValidISBN('abc')).toBe(false);
      expect(isValidISBN(undefined)).toBe(false);
    });
  });

  describe('fetchBookByISBN()', () => {
    it('busca livro com sucesso e mapeia campos', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(sampleResponse),
        })
      );

      const result = await fetchBookByISBN('9780134685991');

      expect(result).toEqual({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook of agile software craftsmanship',
        urlCapa: 'https://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('isbn:9780134685991'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
            'User-Agent': 'BibliotecaEmprestimos/1.0 (educacional)',
          }),
        })
      );
    });

    it('retorna cache para o mesmo ISBN sem nova chamada HTTP', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(sampleResponse),
        })
      );

      await fetchBookByISBN('9780134685991');
      await fetchBookByISBN('978-0134685991');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('faz trim do ISBN antes de buscar', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(sampleResponse),
        })
      );

      await fetchBookByISBN('  9780134685991  ');
      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('isbn:9780134685991');
    });

    it('lança erro para ISBN vazio', async () => {
      await expect(fetchBookByISBN('')).rejects.toThrow('ISBN é obrigatório');
    });

    it('lança erro para livro não encontrado', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ items: [] }),
        })
      );

      await expect(fetchBookByISBN('9999999999999')).rejects.toThrow(
        'Nenhum livro encontrado com ISBN: 9999999999999'
      );
    });

    it('lança erro para falha HTTP', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        })
      );

      await expect(fetchBookByISBN('9780134685991')).rejects.toThrow(
        'Erro ao conectar com Google Books: 500'
      );
    });

    it('lança erro amigável para falha de rede', async () => {
      global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));

      await expect(fetchBookByISBN('9780134685991')).rejects.toThrow(
        'Falha na conexão com Google Books. Verifique sua internet e tente novamente.'
      );
    });

    it('faz retry automático em 429 e conclui com sucesso', async () => {
      const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return 0;
      });

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(sampleResponse) });

      const result = await fetchBookByISBN('9780134685991');

      expect(result.titulo).toBe('Clean Code');
      expect(global.fetch).toHaveBeenCalledTimes(3);

      timeoutSpy.mockRestore();
    });

    it('usa fallback Open Library após estourar tentativas de 429', async () => {
      const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return 0;
      });

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: false, status: 429, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              'ISBN:9780134685991': {
                title: 'Clean Code (Open Library)',
                authors: [{ name: 'Robert C. Martin' }],
                description: 'Fallback source',
                cover: { medium: 'http://example.com/openlibrary.jpg' },
              },
            }),
        });

      const result = await fetchBookByISBN('9780134685991');

      expect(result.titulo).toBe('Clean Code (Open Library)');
      expect(result.autor).toBe('Robert C. Martin');
      expect(global.fetch).toHaveBeenCalledTimes(4);
      timeoutSpy.mockRestore();
    });
  });
});