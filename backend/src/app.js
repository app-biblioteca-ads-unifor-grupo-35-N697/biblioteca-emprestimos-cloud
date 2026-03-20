const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter  = require("./routes/auth");
const apiRouter = require("./routes/api");
const errorMiddleware = require("./middlewares/error-middleware");
const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();

// Configuração do CORS para permitir requisições do frontend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://biblioteca-emprestimos-cloud.vercel.app',
    /\.vercel\.app$/  // Permite todos os subdomínios da Vercel (previews)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use(errorMiddleware);

module.exports = app;
