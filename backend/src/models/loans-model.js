const prisma = require('../database/prisma');
const HttpError = require("../errors/HttpError");
const booksModel = require("./books-model");

module.exports = {
  getAllLoans: () => prisma.loan.findMany(),

  getLoanById: (id) => prisma.loan.findUnique({ where: { id } }),

  createLoan: async (user, book) => {
    if (book.quantiteAvailable <= 0)
      throw new HttpError(400, "Não há exemplares disponíveis para emprestar");

    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 14);

    const newLoan = await prisma.loan.create({
      data: {
        userId: user.id,
        bookId: book.id,
        loanDate: today,
        returnDate: returnDate,
        isReturned: false,
        isLate: false,
      }
    });

    await booksModel.takeBook(book.id);
    return newLoan;
  },

  returnLoan: async (id) => {
    const loan = await prisma.loan.findUnique({ where: { id } });
    if (!loan) throw new HttpError(404, "Empréstimo não encontrado!");
    if (loan.isReturned) return null;

    const today = new Date();
    const limitDate = new Date(loan.returnDate);

    const updated = await prisma.loan.update({
      where: { id },
      data: {
        isReturned: true,
        isLate: today > limitDate,
        returnDate: today,
      }
    });

    await booksModel.returnBook(loan.bookId);
    return updated;
  }
}

