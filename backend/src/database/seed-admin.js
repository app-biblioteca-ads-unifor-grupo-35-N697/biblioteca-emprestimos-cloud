const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function main() {
  const adminEmail = 'admin@biblioteca.com';

  // Usa a senha do arquivo .env ou uma senha forte padrão se não existir no ambiente
  const adminPassword = process.env.ADMIN_PASSWORD || 'Biblioteca@Cloud#2026';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin', // Garante que, se o usuário já existir, ele tenha a permissão de admin
    },
    create: {
      name: 'Admin',
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      role: 'admin',
    },
  });
  console.log(`Admin inicial garantido no banco de dados: ${adminEmail}`);
  console.log('Atenção: Se este for um ambiente de produção, altere a senha imediatamente.');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
