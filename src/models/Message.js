const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        _id: {
            type: String, // UUIDv7 — sortable by time
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        senderId: {
            type: String,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
        },
        reactions: [
            {
                userId: { type: String, ref: 'User' },
                type: { type: String, enum: ['like', 'love', 'haha', 'sad', 'angry'] },
            },
        ],
    },
    {
        timestamps: true,
        _id: false, // Use custom UUIDv7 _id
    }
);

// Compound index for cursor-based pagination: get messages by conversation, newest first
messageSchema.index({ conversationId: 1, _id: -1 });

// Index for finding reactions by user
messageSchema.index({ 'reactions.userId': 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
