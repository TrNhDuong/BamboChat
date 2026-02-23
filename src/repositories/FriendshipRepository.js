const Friendship = require('../models/Friendship');

class FriendshipRepository {
    async create({ requesterId, addresseeId }) {
        return Friendship.create({ requesterId, addresseeId, status: 'pending' });
    }

    /**
     * Find friendship record between two users (in either direction).
     */
    async findByUsers(userId1, userId2) {
        return Friendship.findOne({
            $or: [
                { requesterId: userId1, addresseeId: userId2 },
                { requesterId: userId2, addresseeId: userId1 },
            ],
        });
    }

    /**
     * Get all accepted friends for a user.
     */
    async findFriends(userId) {
        return Friendship.find({
            $or: [{ requesterId: userId }, { addresseeId: userId }],
            status: 'accepted',
        });
    }

    /**
     * Get pending friend requests received by a user.
     */
    async findPendingRequests(userId) {
        return Friendship.find({
            addresseeId: userId,
            status: 'pending',
        });
    }

    /**
     * Get pending friend requests sent by a user.
     */
    async findSentRequests(userId) {
        return Friendship.find({
            requesterId: userId,
            status: 'pending',
        });
    }

    async updateStatus(id, status) {
        return Friendship.findByIdAndUpdate(id, { status }, { new: true });
    }

    async findById(id) {
        return Friendship.findById(id);
    }

    async delete(id) {
        return Friendship.findByIdAndDelete(id);
    }
}

module.exports = new FriendshipRepository();
