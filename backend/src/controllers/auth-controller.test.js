const request = require('supertest');
const express = require('express');
const authController = require('./auth-controller');
const usersModel = require('../models/users-model');
const jwt = require('jsonwebtoken');
const errorHandler = require('../middlewares/error-handler');

jest.mock('../models/users-model');
jest.mock('jsonwebtoken');
jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compareSync: jest.fn(),
}));
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.use(errorHandler);

describe('Auth Controller - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 400 se algum campo estiver faltando', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todos os campos são obrigatórios');
  });

  it('deve retornar 400 se a senha tiver menos de 6 caracteres', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('A senha deve ter pelo menos 6 caracteres.');
  });

  it('deve retornar 400 se o email já estiver cadastrado', async () => {
    usersModel.getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });

    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123456' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('E-mail já cadastrado!');
  });

  it('deve retornar 400 se o email for inválido', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'invalid-email', password: '123456' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email inválido.');
  });

  it('deve retornar 201 e criar um novo usuário se os dados forem válidos', async () => {
    usersModel.getUserByEmail.mockResolvedValue(null);
    usersModel.createUser.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword'
    });

    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: '123456' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.password).toBeUndefined();
  });
});

describe('Auth Controller - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar 400 se algum campo estiver faltando', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todos os campos são obrigatórios');
  });

  it('deve retornar 400 se o email for inválido', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'invalid-email', password: '123456' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email inválido.');
  });

  it('deve retornar 401 se o usuário não existir', async () => {
    usersModel.getUserByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('E-mail ou senha incorretos!');
  });

  it('deve retornar 401 se a senha estiver incorreta', async () => {
    usersModel.getUserByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    bcrypt.compareSync.mockReturnValue(false);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('E-mail ou senha incorretos!');
  });

  it('deve retornar 200 e um token se os dados forem válidos', async () => {
    usersModel.getUserByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    bcrypt.compareSync.mockReturnValue(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('fake-jwt-token');
  });
});