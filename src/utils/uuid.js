const { v7: uuidv7 } = require('uuid');

/**
 * Generate a UUIDv7 — time-sortable unique ID.
 * Used as primary key for messages to enable cursor-based pagination.
 */
const generateUUIDv7 = () => {
    return uuidv7();
};

module.exports = { generateUUIDv7 };
