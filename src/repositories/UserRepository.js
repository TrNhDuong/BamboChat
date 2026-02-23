const User = require('../models/User');

class UserRepository {
    async findById(id) {
        return User.findById(id);
    }

    async findByEmail(email) {
        return User.findOne({ email });
    }

    async create({ id, email, passwordHash }) {
        return User.create({ _id: id, email, passwordHash });
    }

    async updateVerified(id, isVerified) {
        return User.findByIdAndUpdate(id, { isVerified }, { new: true });
    }

    async updateProfile(id, { displayName, bio }) {
        return User.findByIdAndUpdate(id, { displayName, bio }, { new: true, runValidators: true });
    }

    async updateAvatar(id, avatar) {
        return User.findByIdAndUpdate(id, { avatar }, { new: true });
    }

    async searchById(partialId) {
        // Case-insensitive partial match, hide sensitive fields
        return User.find(
            { _id: { $regex: partialId, $options: 'i' } },
            { passwordHash: 0 }
        ).limit(20);
    }
}

module.exports = new UserRepository();
