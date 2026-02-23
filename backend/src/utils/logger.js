const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0 && metadata.stack) {
        msg += `\n${metadata.stack}`;
    } else if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

// Create the logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        }),
        // Error log transport
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            ),
        }),
        // Combined log transport
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            format: winston.format.combine(
                winston.format.uncolorize(),
                logFormat
            ),
        }),
    ],
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
    ]
});

// Stream for morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = logger;
