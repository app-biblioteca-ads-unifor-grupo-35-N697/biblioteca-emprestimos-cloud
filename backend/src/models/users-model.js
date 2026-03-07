const prisma = require('../database/prisma')
const bcrypt = require('bcrypt')

module.exports = {
  getAllUsers: () => prisma.user.findMany(),

  getUserById: (id) => prisma.user.findUnique({ where: { id } }),

  getUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),

  createUser: (name, email, password) =>
    prisma.user.create({
      data: { name, email, password: bcrypt.hashSync(password, 10) }
    })
}