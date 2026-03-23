const HttpError = require("../errors/HttpError")
const booksModel = require("../models/books-model")
const loansModel = require("../models/loans-model")

module.exports = {
 // GET   /api/loans ---busca todos os emprestimos
 index: async (req, res, next) => {
    try {
      const loans = await loansModel.getAllLoans()
      res.json(loans)
    } catch (error) {
      next(error)
    }
 },

 // GET   /api/loans/:id ---busca um emprestimo por id
 show: async (req, res, next) => {
  try {
    const { id } = req.params
    const loan = await loansModel.getLoanById(id)
    if (!loan) throw new HttpError(404, "emprestimo nao encontrado")
    res.json(loan)
  } catch (error) {
    next(error)
  }
 },

 // POST  /api/loans ---cria um novo emprestimo
 save: async (req, res, next) => {
   try {
     const user = req.user
     const { bookId } = req.body

     if (typeof bookId !== 'string') throw new HttpError(400, 'ID de livro inválido!')

     const book = await booksModel.getBookById(bookId)
     if (!book) throw new HttpError(404, 'Livro não encontrado!')

     const newLoan = await loansModel.createLoan(user, book)
     res.status(201).json(newLoan)
   } catch (error) {
     next(error)
   }
 },

  // POST /api/loans/:id/return
  return: async (req, res, next) => {
   try {
     const { id } = req.params
     const loan = await loansModel.returnLoan(id)
     res.json(loan)
   } catch (error) {
     next(error)
   }
 }
}