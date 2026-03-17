const express = require('express');
const usersController = require('../controllers/users-controller');
const { ensureAuth, ensureAdmin } = require('../middlewares/auth-middleware');

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: CRUD de usuários (restrito a admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     description: Apenas administradores podem acessar.
 *     responses:
 *       200: { description: Lista de usuários }
 *       403: { description: Acesso negado }
 */
router.get('/', ensureAuth, ensureAdmin, usersController.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     description: Apenas administradores podem acessar.
 *     responses:
 *       200: { description: Usuário encontrado }
 *       404: { description: Usuário não encontrado }
 *       403: { description: Acesso negado }
 */
router.get('/:id', ensureAuth, ensureAdmin, usersController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     description: Apenas administradores podem acessar.
 *     responses:
 *       201: { description: Usuário criado }
 *       400: { description: Dados inválidos }
 *       403: { description: Acesso negado }
 */
router.post('/', ensureAuth, ensureAdmin, usersController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     description: Apenas administradores podem acessar.
 *     responses:
 *       200: { description: Usuário atualizado }
 *       404: { description: Usuário não encontrado }
 *       403: { description: Acesso negado }
 */
router.put('/:id', ensureAuth, ensureAdmin, usersController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remover usuário
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     description: Apenas administradores podem acessar. Não é permitido remover o último admin.
 *     responses:
 *       204: { description: Usuário removido }
 *       403: { description: Acesso negado }
 *       404: { description: Usuário não encontrado }
 */
router.delete('/:id', ensureAuth, ensureAdmin, usersController.remove);

module.exports = router;
