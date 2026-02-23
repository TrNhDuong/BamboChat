const friendService = require('../services/FriendService');

class FriendController {
    async getFriends(req, res, next) {
        try {
            const friends = await friendService.getFriends(req.user.userId);
            return res.status(200).json(friends);
        } catch (error) {
            next(error);
        }
    }

    async getPendingRequests(req, res, next) {
        try {
            const requests = await friendService.getPendingRequests(req.user.userId);
            return res.status(200).json(requests);
        } catch (error) {
            next(error);
        }
    }

    async getSentRequests(req, res, next) {
        try {
            const requests = await friendService.getSentRequests(req.user.userId);
            return res.status(200).json(requests);
        } catch (error) {
            next(error);
        }
    }

    async sendRequest(req, res, next) {
        try {
            const { addresseeId } = req.body;

            if (!addresseeId) {
                return res.status(400).json({ message: 'addresseeId is required' });
            }

            const result = await friendService.sendRequest(req.user.userId, addresseeId);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async respondToRequest(req, res, next) {
        try {
            const { id } = req.params;
            const { action } = req.body; // 'accept' or 'reject'

            if (!action) {
                return res.status(400).json({ message: 'action is required (accept/reject)' });
            }

            const result = await friendService.respondToRequest(req.user.userId, id, action);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async unfriend(req, res, next) {
        try {
            const { id } = req.params;
            const result = await friendService.unfriend(req.user.userId, id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FriendController();
