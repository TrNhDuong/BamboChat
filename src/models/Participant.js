const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        userId: {
            type: String,
            ref: 'User',
            required: true,
        },
        lastReadMessageId: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member',
        },
    },
    {
        timestamps: true,
    }
);

// Composite unique index: one user per conversation
participantSchema.index({ conversationId: 1, userId: 1 }, { unique: true });

// Index for getting all conversations of a user
participantSchema.index({ userId: 1 });

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
