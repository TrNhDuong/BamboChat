const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: [true, 'User ID is required'],
            trim: true,
            maxlength: [50, 'User ID cannot exceed 50 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        displayName: {
            type: String,
            trim: true,
            maxlength: [50, 'Display name cannot exceed 50 characters'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [160, 'Bio cannot exceed 160 characters'],
        },
        avatar: {
            url: { type: String, default: null },
            public_id: { type: String, default: null },
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Only unique if present
        },
    },
    {
        timestamps: true,
        _id: false, // Disable auto-generated ObjectId, use custom string _id
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
