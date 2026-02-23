const { Router } = require('express');
const conversationController = require('../controllers/ConversationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// All conversation routes require authentication
router.use(authMiddleware);

// POST /api/conversations
router.post('/', conversationController.create);

// GET /api/conversations
router.get('/', conversationController.getConversations);

// GET /api/conversations/:id/messages
router.get('/:id/messages', conversationController.getMessages);

// POST /api/conversations/:id/participants
router.post('/:id/participants', conversationController.addParticipants);

// DELETE /api/conversations/:id/participants/:userId  (kick member)
router.delete('/:id/participants/:userId', conversationController.kickParticipant);

module.exports = router;
