const request = require('supertest');
const app = require('../app');
const prisma = require('../database/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Utilitário para criar token
function createToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_KEY);
}

describe('RBAC/CRUD Usuários', () => {
  let admin, user, adminToken, userToken;

  beforeAll(async () => {
    // Cria admin e user
    admin = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email: 'admin-teste@biblioteca.com',
        password: bcrypt.hashSync('senha123', 10),
        role: 'admin',
      },
    });
    user = await prisma.user.create({
      data: {
        name: 'User Test',
        email: 'user-teste@biblioteca.com',
        password: bcrypt.hashSync('senha123', 10),
        role: 'user',
      },
    });
    adminToken = createToken(admin);
    userToken = createToken(user);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: ['admin-teste@biblioteca.com', 'user-teste@biblioteca.com'] } } });
    await prisma.$disconnect();
  });

  it('admin pode listar usuários', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('usuário comum NÃO pode listar usuários', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('não permite remover o último admin', async () => {
    // Garante que só há 1 admin
    await prisma.user.deleteMany({ where: { role: 'admin', NOT: { email: 'admin-teste@biblioteca.com' } } });
    const res = await request(app)
      .delete(`/api/users/${admin.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/último admin/i);
  });
});
