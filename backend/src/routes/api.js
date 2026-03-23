
const express = require("express");
const apiRouter = express.Router();

const booksController = require("../controllers/books-controller");
const loansController = require("../controllers/loans-controller");
const usersRouter = require("./users");
const { ensureAuth } = require("../middlewares/auth-middleware");

/**
 * @swagger
 * tags:
 *   - name: Books
 *     description: Gerenciamento de livros
 *   - name: Loans
 *     description: Gerenciamento de empréstimos
 */

/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Buscar livros por autor (query param)
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: author
 *         required: true
 *         schema: { type: string }
 *         example: Martin
 *     responses:
 *       200: { description: Lista de livros encontrados }
 *       404: { description: Nenhum livro encontrado }
 */

// Rotas de usuários (CRUD restrito a admin)
apiRouter.use("/users", usersRouter);

apiRouter.get("/books/search", booksController.findByAuthor);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Buscar livro por ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Livro encontrado }
 *       404: { description: Livro não encontrado }
 */
apiRouter.get("/books/:id", booksController.show);

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Listar todos os livros
 *     tags: [Books]
 *     responses:
 *       200: { description: Lista de livros }
 */
apiRouter.get("/books", booksController.index);

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Criar novo livro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, quantiteAvailable]
 *             properties:
 *               title:             { type: string, example: Clean Code }
 *               author:            { type: string, example: Robert C. Martin }
 *               quantiteAvailable: { type: integer, example: 5 }
 *     responses:
 *       201: { description: Livro criado }
 *       400: { description: Dados inválidos }
 */
apiRouter.post("/books", ensureAuth, booksController.save);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Atualizar livro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:             { type: string }
 *               author:            { type: string }
 *               quantiteAvailable: { type: integer }
 *     responses:
 *       200: { description: Livro atualizado }
 *       404: { description: Livro não encontrado }
 */
apiRouter.put("/books/:id", ensureAuth, booksController.update);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Deletar livro
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Livro deletado }
 *       404: { description: Livro não encontrado }
 */
apiRouter.delete("/books/:id", ensureAuth, booksController.delete);

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Listar todos os empréstimos
 *     tags: [Loans]
 *     responses:
 *       200: { description: Lista de empréstimos }
 */
apiRouter.get("/loans", loansController.index);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Buscar empréstimo por ID
 *     tags: [Loans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Empréstimo encontrado }
 *       404: { description: Empréstimo não encontrado }
 */
apiRouter.get("/loans/:id", loansController.show);

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Criar empréstimo (requer JWT)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId]
 *             properties:
 *               bookId: { type: string, example: uuid-do-livro }
 *     responses:
 *       201: { description: Empréstimo criado }
 *       400: { description: Sem exemplares disponíveis }
 *       401: { description: Token inválido ou ausente }
 *       404: { description: Livro não encontrado }
 */
apiRouter.post("/loans", ensureAuth, loansController.save);

/**
 * @swagger
 * /api/loans/{id}/return:
 *   post:
 *     summary: Devolver livro
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Devolução registrada }
 *       404: { description: Empréstimo não encontrado }
 */
apiRouter.post("/loans/:id/return", ensureAuth, loansController.return);

module.exports = apiRouter;

// apiRouter.get("/books?author=nome", booksController.findBookByAuthor); 

// module.exports = apiRouter;