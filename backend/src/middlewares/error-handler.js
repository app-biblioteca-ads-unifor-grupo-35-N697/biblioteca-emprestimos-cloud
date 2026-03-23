const HttpError = require('../errors/HttpError');

/**
 * Middleware global de tratamento de erros para o Express.
 * Deve ser o último middleware a ser adicionado no app.
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro no console para depuração (em produção, use um logger mais robusto)
  console.error('ERRO CAPTURADO:', err);

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Para erros inesperados, retorna uma mensagem genérica para não expor detalhes
  return res.status(500).json({
    error: 'Ocorreu um erro inesperado no servidor.',
  });
};

module.exports = errorHandler;