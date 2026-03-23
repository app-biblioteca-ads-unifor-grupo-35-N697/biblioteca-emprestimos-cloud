const usersModel = require('../models/users-model');
const HttpError = require('../errors/HttpError');

module.exports = {
  // Listar todos os usuários (apenas admin)
  getAll: async (req, res, next) => {
    try {
      const users = await usersModel.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  // Buscar usuário por ID (apenas admin)
  getById: async (req, res, next) => {
    try {
      const user = await usersModel.getUserById(req.params.id);
      if (!user) throw new HttpError(404, 'Usuário não encontrado');
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  // Criar usuário (apenas admin)
  create: async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        throw new HttpError(400, 'Dados obrigatórios ausentes');
      }
      const user = await usersModel.createUser(name, email, password, role);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },

  // Atualizar usuário (apenas admin)
  update: async (req, res, next) => {
    try {
      const { name, email, role } = req.body;
      const { id } = req.params;
      const user = await usersModel.updateUser(id, { name, email, role });
      if (!user) throw new HttpError(404, 'Usuário não encontrado');
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  // Deletar usuário (apenas admin)
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      // Proteção: não remover último admin
      const user = await usersModel.getUserById(id);
      if (!user) throw new HttpError(404, 'Usuário não encontrado');
      if (user.role === 'admin') {
        const admins = await usersModel.countAdmins();
        if (admins <= 1) {
          throw new HttpError(403, 'Não é permitido remover o último admin.');
        }
      }
      await usersModel.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
