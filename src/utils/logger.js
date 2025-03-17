const winston = require("winston");
require("winston-mongodb");

// Define MongoDB connection string
const MONGO_URI = `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/logs_db`; // Replace with your MongoDB connection string

// Create a Winston logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Store logs in JSON format
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}] ${message}`;
        })
      ),
    }),

    new winston.transports.MongoDB({
      db: MONGO_URI,
      collection: "app_logs",
      level: "info",
      storeHost: true,
      capped: true,
      cappedSize: 10000000,
    }),
  ],
});

// If in development, add console transport for debugging
if (process.env.NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// ✅ Add custom `logInfo` method
logger.logInfo = (level, message, data) => {
  logger.log({
    level,
    message,
    data, // Store inside `data` key instead of `meta`
  });
};

module.exports = logger;
