const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['direct_message', 'group'],
            required: true,
        },
        name: {
            type: String,
            default: null, // NULL if direct_message
        },
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
