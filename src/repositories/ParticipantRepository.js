const Participant = require('../models/Participant');

class ParticipantRepository {
    async create({ conversationId, userId, role = 'member' }) {
        return Participant.create({ conversationId, userId, role });
    }

    async findByConversationAndUser(conversationId, userId) {
        return Participant.findOne({ conversationId, userId });
    }

    async updateLastRead(conversationId, userId, messageId) {
        return Participant.findOneAndUpdate(
            { conversationId, userId },
            { lastReadMessageId: messageId },
            { new: true }
        );
    }

    async findByUser(userId) {
        return Participant.find({ userId });
    }

    async findByConversation(conversationId) {
        return Participant.find({ conversationId });
    }

    async removeParticipant(conversationId, userId) {
        return Participant.findOneAndDelete({ conversationId, userId });
    }
}

module.exports = new ParticipantRepository();
