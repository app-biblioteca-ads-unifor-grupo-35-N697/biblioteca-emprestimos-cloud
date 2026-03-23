const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter  = require("./routes/auth");
const apiRouter = require("./routes/api");
const errorHandler = require("./middlewares/error-handler");
const { swaggerUi, swaggerSpec } = require("./swagger");

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRouter);
app.use("/api", apiRouter);
app.use(errorHandler);

module.exports = app;
