const prisma = require('../database/prisma')
const bcrypt = require('bcrypt')

module.exports = {
  getAllUsers: () => prisma.user.findMany(),

  getUserById: (id) => prisma.user.findUnique({ where: { id } }),

  getUserByEmail: (email) => prisma.user.findUnique({ where: { email } }),

  createUser: (name, email, password, role = 'user') =>
    prisma.user.create({
      data: { name, email, password: bcrypt.hashSync(password, 10), role }
    }),

  updateUser: (id, data) =>
    prisma.user.update({
      where: { id },
      data
    }),

  deleteUser: (id) =>
    prisma.user.delete({ where: { id } }),

  countAdmins: () =>
    prisma.user.count({ where: { role: 'admin' } }),
}