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
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        throw new HttpError(400, "Todos os campos são obrigatórios");
      }

      if (!isValidEmail(email)) {
        throw new HttpError(400, "Email inválido.");
      }
      if (password.length < 6) {
        throw new HttpError(400, "A senha deve ter pelo menos 6 caracteres.");
      }
      const existingUser = await usersModel.getUserByEmail(email);
      if (existingUser) {
        throw new HttpError(400, "E-mail já cadastrado!");
      }
      const newUser = await usersModel.createUser(name, email, password);
      res.status(201).json({ ...newUser, password: undefined });
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (typeof email !== "string" || typeof password !== "string") {
        throw new HttpError(400, "Todos os campos são obrigatórios");
      }

      if (!isValidEmail(email)) {
        throw new HttpError(400, "Email inválido.");
      }

      const user = await usersModel.getUserByEmail(email);

      if (!user) {
        throw new HttpError(401, "E-mail ou senha incorretos!");
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword) {
        throw new HttpError(401, "E-mail ou senha incorretos!");
      }
      const payload = { id: user.id, email: user.email }
      const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: "1d" });

      res.json({ token });
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/logout
  logout: async (req, res, next) => {
    // Implementação do logout
  },
};
