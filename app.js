require('dotenv').config();
require('./src/utils/res-ext');
const express = require("express");
const apiRouter = require("./src/routes/index.router");
const http = require("http");
const { AppDataSource } = require('./src/utils/ormconfig');
const logger = require('./src/utils/logger');
const extendResponse = require('./src/utils/res-ext');
const safeCode = require('./src/utils/safe-code');

const app = express();
app.use(express.json());
app.use(extendResponse);
AppDataSource.initialize()
    .then(() => console.log(`Connected to ${process.env.DB_TYPE} database`))
    .catch((err) => console.error("Database connection error:", err));

app.use("/api", safeCode(apiRouter));

/* istanbul ignore next */ 
process.on('unhandledRejection', (reason) => {
    throw new Error(reason.message || reason);
});

/* istanbul ignore next */ 
process.on('uncaughtException', (error) => {
    throw error;
});
app.use((req, res, next) => {
    return res.NotFound(`Cannot ${req.method} ${req.originalUrl}`);
});
app.use((err, req, res, next) => {
    logger.error(err?.message, err);
    res.InternalServerError({ message: err?.message, stack: err?.stack || err });
});

const server = http.createServer(app);
module.exports = server;
