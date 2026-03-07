const express = require('express');
const authController = require('../controllers/auth-controller');
const authRouter = express.Router();
const { ensureAuth } = require('../middlewares/auth-middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação de usuários
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastrar novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: João Silva }
 *               email:    { type: string, example: joao@email.com }
 *               password: { type: string, example: senha123 }
 *     responses:
 *       201: { description: Usuário criado com sucesso }
 *       400: { description: Dados inválidos ou e-mail já cadastrado }
 */
authRouter.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login — retorna token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: joao@email.com }
 *               password: { type: string, example: senha123 }
 *     responses:
 *       200: { description: Token JWT gerado }
 *       401: { description: Credenciais inválidas }
 */
authRouter.post('/login', authController.login);

/**
 * @swagger
 * /auth/teste:
 *   get:
 *     summary: Testar autenticação JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Token válido }
 *       401: { description: Token inválido ou ausente }
 */
authRouter.get("/teste", ensureAuth, (req, res) => res.json({ message: "teste ok" }));

module.exports = authRouter;
