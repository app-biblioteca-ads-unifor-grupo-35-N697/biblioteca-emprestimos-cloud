const prisma = require('../database/prisma');
const { execSync } = require('child_process');

describe('Seed Admin Inicial', () => {
  const adminEmail = 'admin@biblioteca.com';

  beforeAll(async () => {
    // Limpa os empréstimos primeiro para não dar erro de constraint ao apagar os usuários
    await prisma.loan.deleteMany();
    // Remove todos os admins para simular ambiente sem admin
    await prisma.user.deleteMany({ where: { role: 'admin' } });
    // Também remove qualquer admin-teste@biblioteca.com que possa existir
    await prisma.user.deleteMany({ where: { email: 'admin-teste@biblioteca.com' } });
  });

  afterAll(async () => {
    // Limpa os empréstimos primeiro
    await prisma.loan.deleteMany();
    // Limpa o admin criado pelo seed para não afetar outros testes
    await prisma.user.deleteMany({ where: { email: adminEmail } });
    await prisma.$disconnect();
  });

  it('deve garantir que existe pelo menos um admin', async () => {
    // Executa o script de seed
    execSync('node src/database/seed-admin.js');
    // Verifica se existe pelo menos um admin
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    expect(admin).toBeTruthy();
    expect(admin.role).toBe('admin');
    // Não verifica o email, só garante que existe um admin
  });
});
