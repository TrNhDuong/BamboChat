const { Router } = require('express');
const friendController = require('../controllers/FriendController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// All friend routes require authentication
router.use(authMiddleware);

// GET /api/friends
router.get('/', friendController.getFriends);

// GET /api/friends/requests/pending
router.get('/requests/pending', friendController.getPendingRequests);

// GET /api/friends/requests/sent
router.get('/requests/sent', friendController.getSentRequests);

// POST /api/friends/requests
router.post('/requests', friendController.sendRequest);

// PUT /api/friends/requests/:id
router.put('/requests/:id', friendController.respondToRequest);

// DELETE /api/friends/:id
router.delete('/:id', friendController.unfriend);

module.exports = router;
