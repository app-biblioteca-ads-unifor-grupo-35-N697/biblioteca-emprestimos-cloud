const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function main() {
  const adminEmail = 'admin@biblioteca.com';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin', // Garante que, se o usuário já existir, ele tenha a permissão de admin
    },
    create: {
      name: 'Admin',
      email: adminEmail,
      password: bcrypt.hashSync('senha123', 10),
      role: 'admin',
    },
  });
  console.log('Admin inicial garantido no banco de dados:', adminEmail);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
