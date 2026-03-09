const booksModel = require('./books-model');

jest.mock('../database/prisma', () => ({
  book: {
    findMany:   jest.fn(),
    findFirst:  jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
  }
}));

const prisma = require('../database/prisma');

describe('Books Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    test('deve retornar todos os livros', async () => {
      const mockBooks = [
        { id: '1', title: 'Book one' },
        { id: '2', title: 'Book two' }
      ];
      prisma.book.findMany.mockResolvedValue(mockBooks);

      const books = await booksModel.getAllBooks();
      expect(books).toHaveLength(2);
      expect(books[0].id).toBe('1');
    });
  });

  describe('createBook', () => {
    test('deve criar um novo livro', async () => {
      const mockBook = { id: 'mocked-uuid', title: 'Novo Livro', author: 'Novo Autor', quantiteAvailable: 5 };
      prisma.book.create.mockResolvedValue(mockBook);

      const newBook = await booksModel.createBook('Novo Livro', 'Novo Autor', 5);
      expect(newBook).toEqual(mockBook);
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: { title: 'Novo Livro', author: 'Novo Autor', quantiteAvailable: 5 }
      });
    });
  });

  describe('getBookById', () => {
    test('deve retornar um livro pelo id quando existir', async () => {
      const mockBook = { id: '1', title: 'Book one', author: 'Author one', quantiteAvailable: 4 };
      prisma.book.findUnique.mockResolvedValue(mockBook);

      const book = await booksModel.getBookById('1');
      expect(book).toEqual(mockBook);
    });

    test('deve retornar null quando o livro não existir', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      const book = await booksModel.getBookById('id-inexistente');
      expect(book).toBeNull();
    });
  });

  describe('getBooksByAuthor', () => {
    test('deve retornar livros do autor', async () => {
      const mockBooks = [{ id: '1', title: 'Book one', author: 'Author one', quantiteAvailable: 4 }];
      prisma.book.findMany.mockResolvedValue(mockBooks);

      const books = await booksModel.getBooksByAuthor('Author one');
      expect(books).toHaveLength(1);
      expect(books[0].author).toBe('Author one');
    });

    test('deve retornar array vazio quando não existir livro do autor', async () => {
      prisma.book.findMany.mockResolvedValue([]);

      const books = await booksModel.getBooksByAuthor('Autor Inexistente');
      expect(books).toHaveLength(0);
    });
  });

  describe('updateBook', () => {
    test('deve atualizar um livro existente', async () => {
      const existingBook = { id: '1', title: 'Book one', author: 'Author one', quantiteAvailable: 4 };
      const updatedBook  = { id: '1', title: 'Título Atualizado', author: 'Author one', quantiteAvailable: 10 };
      prisma.book.findUnique.mockResolvedValue(existingBook);
      prisma.book.update.mockResolvedValue(updatedBook);

      const result = await booksModel.updateBook('1', { title: 'Título Atualizado', quantiteAvailable: 10 });
      expect(result).toEqual(updatedBook);
    });

    test('deve lançar erro quando tentar atualizar livro inexistente', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(booksModel.updateBook('id-inexistente', { title: 'Novo' }))
        .rejects.toThrow('livro não encontrado');
    });
  });

  describe('deleteBook', () => {
    test('deve deletar um livro existente', async () => {
      const existingBook = { id: '1', title: 'Book one', author: 'Author one', quantiteAvailable: 4 };
      prisma.book.findUnique.mockResolvedValue(existingBook);
      prisma.book.delete.mockResolvedValue(existingBook);

      const result = await booksModel.deleteBook('1');
      expect(result).toEqual(existingBook);
    });

    test('deve lançar erro quando tentar deletar livro inexistente', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(booksModel.deleteBook('id-inexistente'))
        .rejects.toThrow('livro não encontrado');
    });
  });
});