const prisma = require('../database/prisma');
const HttpError = require("../errors/HttpError");

module.exports = {
  getAllBooks: () => prisma.book.findMany({ select: { id: true, title: true } }),

  createBook: (title, author, quantiteAvailable) =>
    prisma.book.create({ data: { title, author, quantiteAvailable } }),

  getBookById: (id) => prisma.book.findUnique({ where: { id } }),

  getBookByTitle: (title) => prisma.book.findFirst({ where: { title } }),

  getBooksByAuthor: (author) =>
    prisma.book.findMany({
      where: { author: { contains: author, mode: 'insensitive' } }
    }),

  updateBook: async (id, updateBook) => {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new HttpError(404, 'livro não encontrado');
    return prisma.book.update({ where: { id }, data: updateBook });
  },

  deleteBook: async (id) => {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new HttpError(404, 'livro não encontrado');
    return prisma.book.delete({ where: { id } });
  },

  takeBook: async (id) => {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new HttpError(404, 'livro não encontrado');
    return prisma.book.update({
      where: { id },
      data: { quantiteAvailable: { decrement: 1 } }
    });
  },

  returnBook: async (id) => {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new HttpError(404, 'livro não encontrado');
    return prisma.book.update({
      where: { id },
      data: { quantiteAvailable: { increment: 1 } }
    });
  },

};
