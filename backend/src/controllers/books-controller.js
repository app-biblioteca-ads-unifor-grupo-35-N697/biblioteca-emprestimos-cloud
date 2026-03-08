const booksModel = require("../models/books-model");

module.exports = {
  // GET /api/books  busca todos os livros
  index: async (req, res) => {
    const books = await booksModel.getAllBooks();
    return res.json(books);
  },
  // GET /api/books/:id busca por id
  show: async (req, res) => {
    const { id } = req.params;
    const book = await booksModel.getBookById(id);
    if (!book) return res.status(404).json({ error: "Livro nao encontrado" });
    return res.json(book);
  },

  // GET /api/books/search?author=nome busca por autor
  findByAuthor: async (req, res) => {
    const { author } = req.query;

    if (!author) {
      return res.status(400).json({ error: "Parâmetro 'author' é obrigatório" });
    }

    const books = await booksModel.getBooksByAuthor(author);

    if (!books || books.length === 0) {
      return res.status(404).json({ error: "Livros não encontrados para este autor" });
    }

    return res.json(books);
  },

  // POST /api/books/search/author
  searchByRequestBody: async (req, res) => {
    const { author } = req.body;

    if (!author) {
      return res.status(400).json({ error: "Campo 'author' é obrigatório no corpo da requisição" });
    }

    const books = await booksModel.getBooksByAuthor(author);

    if (!books || books.length === 0) {
      return res.status(404).json({ error: "Livros não encontrados para este autor" });
    }

    return res.json(books);
  },

  // POST /api/books criar um livro
  save: async (req, res) => {
    const { title, author, quantiteAvailable } = req.body;
    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      typeof quantiteAvailable !== "number"
    ) {
      return res.status(400).json({ message: "Dados invalidos!" });
    }
    const newBook = await booksModel.createBook(title, author, quantiteAvailable);
    return res.status(201).json(newBook);
  },

  // PUT /api/books/:id atualizar o livro
  update: async (req, res) => {
    const { id } = req.params;
    const { title, author, quantiteAvailable } = req.body;
    const fieldsToUpdate = {};
    if (title) fieldsToUpdate.title = title;
    if (author) fieldsToUpdate.author = author;
    if (quantiteAvailable) fieldsToUpdate.quantiteAvailable = quantiteAvailable;
    const updatedBook = await booksModel.updateBook(id, fieldsToUpdate);
    return res.json(updatedBook);
  },

  // DELETE /api/books/:id deletar o livro
  delete: async (req, res) => {
    const { id } = req.params;
    const deletedBook = await booksModel.deleteBook(id);
    return res.json(deletedBook);
  }
};
