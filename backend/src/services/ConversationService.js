const conversationRepository = require('../repositories/ConversationRepository');
const participantRepository = require('../repositories/ParticipantRepository');
const logger = require('../utils/logger');

class ConversationService {
    /**
     * Create a new conversation.
     * For direct_message: idempotent — check for existing DM between the two users.
     */
    async createConversation(userId, { type, name, participantIds }) {
        if (type === 'direct_message') {
            if (!participantIds || participantIds.length !== 1) {
                throw { status: 400, message: 'Direct message requires exactly one other participant' };
            }

            const otherUserId = participantIds[0];

            // Check for existing DM conversation between these two users
            const existingConvo = await conversationRepository.findDirectBetweenUsers(userId, otherUserId);
            if (existingConvo) {
                return { conversation: existingConvo, isExisting: true };
            }

            // Create new DM conversation
            const conversation = await conversationRepository.create({ type: 'direct_message', name: null });

            // Add both users as participants
            await participantRepository.create({ conversationId: conversation._id, userId, role: 'admin' });
            await participantRepository.create({ conversationId: conversation._id, userId: otherUserId });

            logger.info(`Direct message conversation created: ${conversation._id}`, { userId, otherUserId });
            return { conversation, isExisting: false };
        }

        // Group conversation
        if (type === 'group') {
            if (!name) {
                throw { status: 400, message: 'Group name is required' };
            }

            const conversation = await conversationRepository.create({ type: 'group', name });

            // Add creator as admin
            await participantRepository.create({ conversationId: conversation._id, userId, role: 'admin' });

            // Add other participants
            if (participantIds && participantIds.length > 0) {
                for (const pid of participantIds) {
                    await participantRepository.create({ conversationId: conversation._id, userId: pid });
                }
            }

            logger.info(`Group conversation created: ${conversation._id}`, { creatorId: userId, participantCount: participantIds.length + 1 });
            return { conversation, isExisting: false };
        }

        throw { status: 400, message: 'Invalid conversation type' };
    }

    /**
     * Get all conversations for a user.
     */
    async getUserConversations(userId) {
        return conversationRepository.findUserConversations(userId);
    }
}

module.exports = new ConversationService();
