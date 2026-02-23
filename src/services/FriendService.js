const friendshipRepository = require('../repositories/FriendshipRepository');
const userRepository = require('../repositories/UserRepository');

class FriendService {
    /**
     * Send a friend request. Check for duplicates.
     */
    async sendRequest(requesterId, addresseeId) {
        if (requesterId === addresseeId) {
            throw { status: 400, message: 'Cannot send friend request to yourself' };
        }

        // Check if addressee exists
        const addressee = await userRepository.findById(addresseeId);
        if (!addressee) {
            throw { status: 404, message: 'User not found' };
        }

        // Check for existing friendship (in either direction)
        const existing = await friendshipRepository.findByUsers(requesterId, addresseeId);
        if (existing) {
            if (existing.status === 'accepted') {
                throw { status: 409, message: 'Already friends' };
            }
            if (existing.status === 'pending') {
                throw { status: 409, message: 'Friend request already pending' };
            }
            if (existing.status === 'blocked') {
                throw { status: 403, message: 'This user is blocked' };
            }
        }

        const friendship = await friendshipRepository.create({ requesterId, addresseeId });

        return { message: 'Friend request sent', friendship };
    }

    /**
     * Accept or reject a friend request.
     */
    async respondToRequest(userId, requestId, action) {
        const friendship = await friendshipRepository.findById(requestId);

        if (!friendship) {
            throw { status: 404, message: 'Friend request not found' };
        }

        // Only the addressee can accept/reject
        if (friendship.addresseeId !== userId) {
            throw { status: 403, message: 'Not authorized to respond to this request' };
        }

        if (friendship.status !== 'pending') {
            throw { status: 400, message: 'This request has already been processed' };
        }

        if (action === 'accept') {
            const updated = await friendshipRepository.updateStatus(requestId, 'accepted');
            return { message: 'Friend request accepted', friendship: updated };
        } else if (action === 'reject') {
            await friendshipRepository.delete(requestId);
            return { message: 'Friend request rejected' };
        } else {
            throw { status: 400, message: 'Invalid action. Use "accept" or "reject".' };
        }
    }

    /**
     * Get all friends of a user.
     */
    async getFriends(userId) {
        const friendships = await friendshipRepository.findFriends(userId);

        // Extract friend IDs (could be requester or addressee)
        const friendIds = friendships.map((f) =>
            f.requesterId === userId ? f.addresseeId : f.requesterId
        );

        // Fetch full user objects so the frontend can display avatars / displayNames
        const users = await Promise.all(
            friendIds.map((id) => userRepository.findById(id))
        );

        // Filter nulls and strip passwordHash
        return users
            .filter(Boolean)
            .map((u) => ({
                _id: u._id,
                email: u.email,
                displayName: u.displayName || null,
                avatar: u.avatar || null,
                isVerified: u.isVerified,
            }));
    }

    /**
     * Get pending friend requests received by a user.
     */
    async getPendingRequests(userId) {
        return friendshipRepository.findPendingRequests(userId);
    }

    /**
     * Get pending friend requests sent by a user.
     */
    async getSentRequests(userId) {
        return friendshipRepository.findSentRequests(userId);
    }

    /**
     * Unfriend or block a user.
     */
    async unfriend(userId, friendId) {
        const friendship = await friendshipRepository.findByUsers(userId, friendId);

        if (!friendship) {
            throw { status: 404, message: 'Friendship not found' };
        }

        await friendshipRepository.delete(friendship._id);

        return { message: 'Unfriended successfully' };
    }
}

module.exports = new FriendService();
