const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware.
 * Catches all errors and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { stack: err.stack, method: req.method, url: req.url });

    // Custom errors thrown from services (with status code)
    if (err.status) {
        return res.status(err.status).json({ message: err.message });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ message: `Duplicate value for field: ${field}` });
    }

    // Default: Internal Server Error
    return res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorHandler;
