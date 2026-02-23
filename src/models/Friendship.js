const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema(
    {
        requesterId: {
            type: String,
            ref: 'User',
            required: true,
        },
        addresseeId: {
            type: String,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'blocked'],
            required: true,
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Composite unique index: only one friendship record between two users
friendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true });

// Index for querying incoming requests efficiently
friendshipSchema.index({ addresseeId: 1 });

const Friendship = mongoose.model('Friendship', friendshipSchema);

module.exports = Friendship;
