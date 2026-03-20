const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter  = require("./routes/auth");
const apiRouter = require("./routes/api");
const errorMiddleware = require("./middlewares/error-middleware");
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
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use(errorMiddleware);

module.exports = app;
