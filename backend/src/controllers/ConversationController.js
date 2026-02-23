const conversationService = require('../services/ConversationService');
const messageService = require('../services/MessageService');

class ConversationController {
    async create(req, res, next) {
        try {
            const { type, name, participantIds } = req.body;

            if (!type) {
                return res.status(400).json({ message: 'type is required (direct_message/group)' });
            }

            const result = await conversationService.createConversation(req.user.userId, {
                type,
                name,
                participantIds,
            });

            const statusCode = result.isExisting ? 200 : 201;
            return res.status(statusCode).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getConversations(req, res, next) {
        try {
            const conversations = await conversationService.getUserConversations(req.user.userId);
            return res.status(200).json(conversations);
        } catch (error) {
            next(error);
        }
    }

    async getMessages(req, res, next) {
        try {
            const { id } = req.params;
            const { cursor, limit } = req.query;

            const messages = await messageService.getMessages(
                req.user.userId,
                id,
                cursor || null,
                parseInt(limit) || 20
            );

            return res.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    }

    async addParticipants(req, res, next) {
        try {
            const { id } = req.params;
            const { participantIds } = req.body;

            if (!participantIds || !Array.isArray(participantIds)) {
                return res.status(400).json({ message: 'participantIds array is required' });
            }

            const result = await conversationService.addParticipants(req.user.userId, id, participantIds);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ConversationController();
