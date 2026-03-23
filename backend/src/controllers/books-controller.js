const booksModel = require("../models/books-model");
const loansModel = require("../models/loans-model");
const HttpError = require("../errors/HttpError");

module.exports = {
  // GET /api/books  busca todos os livros
  index: async (req, res, next) => {
    try {
      const books = await booksModel.getAllBooks();
      return res.json(books);
    } catch (error) {
      next(error);
    }
  },
  // GET /api/books/:id busca por id
  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const book = await booksModel.getBookById(id);
      if (!book) {
        throw new HttpError(404, "Livro não encontrado");
      }
      return res.json(book);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/books/search?author=nome busca por autor
  findByAuthor: async (req, res, next) => {
    try {
      const { author } = req.query;
      if (!author) {
        throw new HttpError(400, "Parâmetro 'author' é obrigatório");
      }
      const books = await booksModel.getBooksByAuthor(author);
      return res.json(books);
    } catch (error) {
      next(error);
    }
  },

  // POST /api/books criar um livro
  save: async (req, res, next) => {
    try {
      const { title, author, quantiteAvailable } = req.body;
      if (
        typeof title !== "string" ||
        typeof author !== "string" ||
        typeof quantiteAvailable !== "number"
      ) {
        throw new HttpError(400, "Dados inválidos! Verifique os tipos de title, author e quantiteAvailable.");
      }
      const newBook = await booksModel.createBook(title, author, quantiteAvailable);
      return res.status(201).json(newBook);
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/books/:id atualizar o livro
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, author, quantiteAvailable } = req.body;
      const fieldsToUpdate = {};
      if (title) fieldsToUpdate.title = title;
      if (author) fieldsToUpdate.author = author;
      if (quantiteAvailable) fieldsToUpdate.quantiteAvailable = quantiteAvailable;
      const updatedBook = await booksModel.updateBook(id, fieldsToUpdate);
      return res.json(updatedBook);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/books/:id deletar o livro
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      // VERIFICAÇÃO: Não permitir exclusão se houver empréstimos associados
      const loansForBook = await loansModel.find({ where: { bookId: id } });
      if (loansForBook && loansForBook.length > 0) {
        throw new HttpError(409, "Não é possível remover o livro, pois ele possui empréstimos associados.");
      }
      const deletedBook = await booksModel.deleteBook(id);
      return res.json(deletedBook);
    } catch (error) {
      next(error);
    }
  }
};
