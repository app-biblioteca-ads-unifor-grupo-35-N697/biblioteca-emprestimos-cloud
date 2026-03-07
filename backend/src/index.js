require("dotenv").config();
const authRouter  = require("./routes/auth");
const apiRouter = require("./routes/api");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorMiddleware = require("./middlewares/error-middleware");
const { swaggerUi, swaggerSpec } = require("./swagger");



const app = express();
// Habilitar CORS para todas as origens
app.use(cors());
app.use(morgan('dev'));



app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/api", apiRouter);

app.use(errorMiddleware);


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



