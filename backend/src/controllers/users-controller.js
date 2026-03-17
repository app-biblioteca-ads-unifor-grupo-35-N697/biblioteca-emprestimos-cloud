const usersModel = require('../models/users-model');

module.exports = {
  // Listar todos os usuários (apenas admin)
  getAll: async (req, res) => {
    const users = await usersModel.getAllUsers();
    res.json(users);
  },

  // Buscar usuário por ID (apenas admin)
  getById: async (req, res) => {
    const user = await usersModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  },

  // Criar usuário (apenas admin)
  create: async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
    }
    const user = await usersModel.createUser(name, email, password, role);
    res.status(201).json(user);
  },

  // Atualizar usuário (apenas admin)
  update: async (req, res) => {
    const { name, email, role } = req.body;
    const { id } = req.params;
    const user = await usersModel.updateUser(id, { name, email, role });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(user);
  },

  // Deletar usuário (apenas admin)
  remove: async (req, res) => {
    const { id } = req.params;
    // Proteção: não remover último admin
    const user = await usersModel.getUserById(id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (user.role === 'admin') {
      const admins = await usersModel.countAdmins();
      if (admins <= 1) {
        return res.status(403).json({ error: 'Não é permitido remover o último admin.' });
      }
    }
    await usersModel.deleteUser(id);
    res.status(204).send();
  },
};
