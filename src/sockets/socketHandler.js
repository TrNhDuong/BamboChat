const { verifyAccessToken } = require('../utils/jwt');
const messageService = require('../services/MessageService');
const participantRepository = require('../repositories/ParticipantRepository');
const logger = require('../utils/logger');

/**
 * Initialize Socket.IO event handlers.
 * JWT authentication is performed at connection time.
 */
const initializeSocket = (io) => {
    // ─────────────────────────────────────────────
    // Connection Middleware: JWT Authentication
    // ─────────────────────────────────────────────
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = verifyAccessToken(token);
            socket.user = decoded; // { userId, email }
            next();
        } catch (error) {
            next(new Error('Invalid or expired token'));
        }
    });

    // ─────────────────────────────────────────────
    // Connection Handler
    // ─────────────────────────────────────────────
    io.on('connection', async (socket) => {
        const userId = socket.user.userId;
        logger.info(`[Socket] User connected: ${userId}`, { socketId: socket.id });

        // Auto-join user to all their conversation rooms
        try {
            const participations = await participantRepository.findByUser(userId);
            for (const p of participations) {
                socket.join(p.conversationId.toString());
            }
        } catch (error) {
            logger.error(`[Socket] Error joining rooms for ${userId}:`, { error: error.message, stack: error.stack });
        }

        // ───────────────────────────────────────────
        // Event: send_message
        // Client → Server
        // ───────────────────────────────────────────
        socket.on('send_message', async ({ conversationId, content }, callback) => {
            try {
                const message = await messageService.createMessage(userId, {
                    conversationId,
                    content,
                });

                // Broadcast to all users in the conversation room
                io.to(conversationId.toString()).emit('receive_message', {
                    id: message._id,
                    conversationId: message.conversationId,
                    senderId: message.senderId,
                    content: message.content,
                    createdAt: message.createdAt,
                });

                if (callback) callback({ success: true, message });
            } catch (error) {
                logger.error('[Socket] send_message error:', { userId, conversationId, error: error.message, stack: error.stack });
                if (callback) callback({ success: false, error: error.message });
            }
        });

        // ───────────────────────────────────────────
        // Event: mark_read
        // Client → Server
        // ───────────────────────────────────────────
        socket.on('mark_read', async ({ conversationId, messageId }, callback) => {
            try {
                const result = await messageService.markAsRead(userId, conversationId, messageId);

                // Broadcast read receipt to conversation room
                io.to(conversationId.toString()).emit('message_read_update', {
                    conversationId,
                    userId,
                    messageId,
                });

                if (callback) callback({ success: true });
            } catch (error) {
                logger.error('[Socket] mark_read error:', { userId, conversationId, messageId, error: error.message, stack: error.stack });
                if (callback) callback({ success: false, error: error.message });
            }
        });

        // ───────────────────────────────────────────
        // Event: send_reaction
        // Client → Server
        // ───────────────────────────────────────────
        socket.on('send_reaction', async ({ messageId, reactionType }, callback) => {
            try {
                const result = await messageService.toggleReaction(userId, {
                    messageId,
                    reactionType,
                });

                // Broadcast reaction update to conversation room
                io.to(result.conversationId.toString()).emit('reaction_update', {
                    messageId: result.messageId,
                    conversationId: result.conversationId,
                    reactions: result.reactions,
                });

                if (callback) callback({ success: true, reactions: result.reactions });
            } catch (error) {
                logger.error('[Socket] send_reaction error:', { userId, messageId, error: error.message, stack: error.stack });
                if (callback) callback({ success: false, error: error.message });
            }
        });

        // ───────────────────────────────────────────
        // Event: typing
        // Client → Server (no DB, direct broadcast)
        // ───────────────────────────────────────────
        socket.on('typing', ({ conversationId, isTyping }) => {
            socket.to(conversationId.toString()).emit('typing', {
                conversationId,
                userId,
                isTyping,
            });
        });

        // ───────────────────────────────────────────
        // Disconnect
        // ───────────────────────────────────────────
        socket.on('disconnect', () => {
            logger.info(`[Socket] User disconnected: ${userId}`, { socketId: socket.id });
        });
    });
};

module.exports = initializeSocket;
