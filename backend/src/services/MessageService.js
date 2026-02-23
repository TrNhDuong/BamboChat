const messageRepository = require('../repositories/MessageRepository');
const participantRepository = require('../repositories/ParticipantRepository');
const { generateUUIDv7 } = require('../utils/uuid');

class MessageService {
    /**
     * Create a new message.
     * Generate UUIDv7, validate room membership, save to DB.
     */
    async createMessage(senderId, { conversationId, content }) {
        // Step 1: Check if sender is a participant of the conversation
        const participant = await participantRepository.findByConversationAndUser(
            conversationId,
            senderId
        );

        if (!participant) {
            throw { status: 403, message: 'You are not a member of this conversation' };
        }

        // Step 2: Generate sortable UUIDv7 as message ID
        const messageId = generateUUIDv7();

        // Step 3: Save message to DB
        const message = await messageRepository.create({
            id: messageId,
            conversationId,
            senderId,
            content,
        });

        return message;
    }

    /**
     * Get message history with cursor-based pagination.
     */
    async getMessages(userId, conversationId, cursor = null, limit = 20) {
        // Validate membership
        const participant = await participantRepository.findByConversationAndUser(
            conversationId,
            userId
        );

        if (!participant) {
            throw { status: 403, message: 'You are not a member of this conversation' };
        }

        return messageRepository.findByConversation(conversationId, cursor, limit);
    }

    /**
     * Mark messages as read (update watermark).
     */
    async markAsRead(userId, conversationId, messageId) {
        const participant = await participantRepository.findByConversationAndUser(
            conversationId,
            userId
        );

        if (!participant) {
            throw { status: 403, message: 'You are not a member of this conversation' };
        }

        await participantRepository.updateLastRead(conversationId, userId, messageId);

        return { conversationId, userId, messageId };
    }

    /**
     * Add, update, or remove a reaction.
     */
    async toggleReaction(userId, { messageId, reactionType }) {
        // 1. Find message to get conversationId
        const message = await messageRepository.findById(messageId);
        if (!message) {
            throw { status: 404, message: 'Message not found' };
        }

        // 2. Validate membership
        const participant = await participantRepository.findByConversationAndUser(
            message.conversationId,
            userId
        );
        if (!participant) {
            throw { status: 403, message: 'You are not a member of this conversation' };
        }

        // 3. Check if user already has this specific reaction
        const existingReaction = message.reactions.find((r) => r.userId === userId);

        let updatedMessage;
        if (existingReaction && existingReaction.type === reactionType) {
            // Same reaction type -> remove it (toggle off)
            updatedMessage = await messageRepository.removeReaction(messageId, userId);
        } else {
            // Different reaction type or no reaction -> add/update (toggle on/update)
            updatedMessage = await messageRepository.addOrUpdateReaction(messageId, userId, reactionType);
        }

        return {
            messageId,
            conversationId: message.conversationId,
            reactions: updatedMessage.reactions,
        };
    }
}

module.exports = new MessageService();
