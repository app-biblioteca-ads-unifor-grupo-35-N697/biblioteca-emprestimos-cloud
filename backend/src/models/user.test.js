const usersModel = require('./users-model');
const bcrypt = require('bcrypt');

jest.mock('../database/prisma', () => ({
  user: {
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
  }
}));
jest.mock('bcrypt');

const prisma = require('../database/prisma');

describe('Users Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar todos os usuários', async () => {
    const mockUsers = [
      { id: '1', name: 'Isaac Pontes', email: 'isaac@email.com', password: 'hash1' },
      { id: '2', name: 'John Doe',     email: 'john@email.com',  password: 'hash2' }
    ];
    prisma.user.findMany.mockResolvedValue(mockUsers);

    const users = await usersModel.getAllUsers();
    expect(users).toHaveLength(2);
  });

  it('deve retornar um usuário pelo ID', async () => {
    const mockUser = { id: '1', name: 'Isaac Pontes', email: 'isaac@email.com', password: 'hash1' };
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const user = await usersModel.getUserById('1');
    expect(user).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('deve retornar um usuário pelo email', async () => {
    const mockUser = { id: '1', name: 'Isaac Pontes', email: 'isaac@email.com', password: 'hash1' };
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const user = await usersModel.getUserByEmail('isaac@email.com');
    expect(user).toEqual(mockUser);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'isaac@email.com' } });
  });

  it('deve criar um novo usuário com senha hasheada', async () => {
    const mockUser = { id: 'uuid-novo', name: 'New User', email: 'new@email.com', password: 'hashedpassword' };
    bcrypt.hashSync.mockReturnValue('hashedpassword');
    prisma.user.create.mockResolvedValue(mockUser);

    const newUser = await usersModel.createUser('New User', 'new@email.com', 'password123');
    expect(newUser).toEqual(mockUser);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: 'New User', email: 'new@email.com', password: 'hashedpassword' }
    });
  });
});