const Conversation = require('../models/Conversation');
const Participant = require('../models/Participant');

class ConversationRepository {
    async create({ type, name }) {
        return Conversation.create({ type, name });
    }

    async findById(id) {
        return Conversation.findById(id);
    }

    /**
     * Find existing direct_message conversation between two specific users.
     * Prevents creating duplicate DM rooms (idempotent).
     */
    async findDirectBetweenUsers(userId1, userId2) {
        // Find conversations where both users are participants and type is direct_message
        const participant1Convos = await Participant.find({ userId: userId1 }).select('conversationId');
        const convoIds = participant1Convos.map((p) => p.conversationId);

        if (convoIds.length === 0) return null;

        // Check if userId2 is also in any of those conversations that are direct_message
        const sharedParticipant = await Participant.findOne({
            conversationId: { $in: convoIds },
            userId: userId2,
        });

        if (!sharedParticipant) return null;

        const conversation = await Conversation.findOne({
            _id: sharedParticipant.conversationId,
            type: 'direct_message',
        });

        return conversation;
    }

    /**
     * Get all conversations a user is part of, with participants.
     */
    async findUserConversations(userId) {
        const participations = await Participant.find({ userId }).select('conversationId');
        const convoIds = participations.map((p) => p.conversationId);

        const conversations = await Conversation.find({ _id: { $in: convoIds } }).sort({ updatedAt: -1 }).lean();

        // Attach participants to each conversation
        const allParticipants = await Participant.find({ conversationId: { $in: convoIds } })
            .populate('userId', 'displayName _id avatar bio')
            .lean();

        // Fetch last messages using Message model
        const Message = require('../models/Message');
        const lastMessages = await Message.find({
            conversationId: { $in: convoIds }
        })
            .sort({ createdAt: -1 })
            .lean();

        // Group last messages by conversationId (since we sorted by date, we can pick the first one for each ID)
        const lastMessageMap = {};
        for (const msg of lastMessages) {
            if (!lastMessageMap[msg.conversationId]) {
                lastMessageMap[msg.conversationId] = {
                    content: msg.content,
                    createdAt: msg.createdAt
                };
            }
        }

        for (const conv of conversations) {
            conv.participants = allParticipants
                .filter((p) => p.conversationId.toString() === conv._id.toString())
                .map((p) => ({
                    _id: p.userId?._id || p.userId,
                    displayName: p.userId?.displayName || null,
                    avatar: p.userId?.avatar || null,
                    bio: p.userId?.bio || null,
                    role: p.role || 'member',
                }));

            conv.lastMessage = lastMessageMap[conv._id] || null;
        }

        return conversations;
    }
}

module.exports = new ConversationRepository();
