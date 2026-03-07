const usersModel = require("../models/users-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const HttpError = require("../errors/HttpError");

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


module.exports = {
  // POST /auth/register
  register: async (req, res) => {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }
    const existingUser = await usersModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "E-mail já cadastrado!" });
    }
    const newUser = await usersModel.createUser(name, email, password);
    res.status(201).json({ ...newUser, password: undefined });
  },

  // POST /auth/login
  login: async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string")
      return res.status(400).json({ message: "Todos os campos são obrigatórios" });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido." });
    }

    const user = await usersModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "E-mail ou senha incorretos!" });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "E-mail ou senha incorretos!" });
    }
    const payload = { id: user.id, email: user.email }
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1d" });

    res.json({ token });
  },

  // POST /auth/logout
  logout: (req, res) => {
    // Implementação do logout
  },
};
