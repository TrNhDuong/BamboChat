const { Router } = require('express');
const userController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

// GET /api/users/search?id={id}
router.get('/search', authMiddleware, userController.search);

// PUT /api/users/profile
router.put('/profile', authMiddleware, userController.updateProfile);

// POST /api/users/avatar
router.post('/avatar', authMiddleware, (req, res, next) => userController.uploadAvatarHandler(req, res, next));

module.exports = router;
