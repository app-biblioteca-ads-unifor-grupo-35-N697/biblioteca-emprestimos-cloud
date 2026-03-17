const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Manager API',
      version: '1.0.0',
      description: 'API REST para gerenciamento de biblioteca — livros, usuários e empréstimos',
    },
    servers: [
  { url: 'https://biblioteca-emprestimos-cloud.onrender.com', description: 'Produção (Render)' },
  { url: 'http://localhost:3001', description: 'Servidor local' }
],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id:    { type: 'string', example: 'uuid' },
            name:  { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
            role:  { type: 'string', example: 'admin', description: 'admin ou user' }
          }
        },
        Book: {
          type: 'object',
          properties: {
            id:                { type: 'string', example: 'uuid' },
            title:             { type: 'string', example: 'Clean Code' },
            author:            { type: 'string', example: 'Robert C. Martin' },
            quantityAvailable: { type: 'integer', example: 5 }
          }
        },
        Loan: {
          type: 'object',
          properties: {
            id:         { type: 'string', example: 'uuid' },
            userId:     { type: 'string', example: 'uuid' },
            bookId:     { type: 'string', example: 'uuid' },
            loanDate:   { type: 'string', format: 'date-time' },
            returnDate: { type: 'string', format: 'date-time', nullable: true },
            isReturned: { type: 'boolean', example: false },
            isLate:     { type: 'boolean', example: false }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = { swaggerUi, swaggerSpec }
