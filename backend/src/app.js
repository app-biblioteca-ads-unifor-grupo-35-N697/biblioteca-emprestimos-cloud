const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter  = require("./routes/auth");
const apiRouter = require("./routes/api");
const errorHandler = require("./middlewares/error-handler");
const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();

// Configuração de CORS para aceitar requisições do frontend
const corsOptions = {
  origin: [
    "http://localhost:3000",      // Desenvolvimento local
    "http://localhost:5173",      // Vite dev (se usado)
    "https://biblioteca-emprestimos-cloud.vercel.app", // Vercel production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Debug CORS (remover em produção)
app.use((req, res, next) => {
  if (process.env.DEBUG_CORS === 'true') {
    console.log(`[CORS DEBUG] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  }
  next();
});
app.use(morgan('dev'));
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use(errorHandler);

module.exports = app;
