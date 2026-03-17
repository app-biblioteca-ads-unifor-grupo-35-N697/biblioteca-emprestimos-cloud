const prisma = require('./prisma');
const bcrypt = require('bcrypt');

async function main() {
  const adminEmail = 'admin@biblioteca.com';
  const adminExists = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: bcrypt.hashSync('senha123', 10),
        role: 'admin',
      },
    });
    console.log('Admin inicial criado:', adminEmail);
  } else {
    console.log('Já existe pelo menos um admin. Nenhuma ação necessária.');
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
