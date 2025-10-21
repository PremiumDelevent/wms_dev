const { createLogger, format, transports } = require("winston");
const path = require("path");

const isTest = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";

// Ruta del archivo de logs
const logFile = path.join(__dirname, "logs", "wms.log");

// Crear logger
const logger = createLogger({
  level: "debug", // nivel mínimo que se guardará
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      const icon = {
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
        debug: "🐛",
      }[level] || "";
      return `${timestamp} ${icon} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    // Siempre escribe en archivo, incluso en test
    new transports.File({ filename: logFile }),
    // Consola solo si no es test
    ...(isTest ? [] : [new transports.Console()])
  ],
});

module.exports = logger;
