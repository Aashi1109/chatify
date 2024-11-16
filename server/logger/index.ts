import { createLogger, format, transports } from "winston";
import * as path from "node:path";
import config from "@config";
import errors = format.errors;

const env = process.env.NODE_ENV || "development";
const logDir = config.log.path;
const logFile = path.join(logDir, "chatify_server.log");

const customFormat = format.printf(
  ({ level, message, timestamp, service, stack, ...temp }) => {
    const logMessage = {
      asctime: timestamp,
      level: level.toUpperCase(),
      service: service,
      message: message,
      stack: stack,
    };
    return JSON.stringify(logMessage);
  }
);

const logger = createLogger({
  level: config.log.level,
  defaultMeta: { service: "Giffy Server" },
  format: format.combine(
    format.splat(),
    format.json(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    customFormat,
    errors({ stack: true })
  ),
  transports: [new transports.File({ filename: logFile })],
  exitOnError: false,
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize()),
    })
  );
}

export default logger;
