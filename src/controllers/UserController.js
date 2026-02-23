const userRepository = require('../repositories/UserRepository');
const { uploadAvatar, destroyCloudinaryAsset } = require('../utils/cloudinaryUpload');

class UserController {
    async search(req, res, next) {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: 'Query parameter "id" is required' });
            }

            const users = await userRepository.searchById(id);
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { displayName, bio } = req.body;
            const userId = req.user.userId; // From authMiddleware

            const updatedUser = await userRepository.updateProfile(userId, { displayName, bio });

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const responseData = {
                _id: updatedUser._id,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                bio: updatedUser.bio,
                isVerified: updatedUser.isVerified,
                avatar: updatedUser.avatar,
            };

            return res.status(200).json(responseData);
        } catch (error) {
            next(error);
        }
    }

    uploadAvatarHandler(req, res, next) {
        uploadAvatar(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message || 'Failed to upload avatar' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file provided' });
            }

            try {
                const userId = req.user.userId;

                // Delete old avatar from Cloudinary if present
                const existingUser = await userRepository.findById(userId);
                if (existingUser?.avatar?.public_id) {
                    await destroyCloudinaryAsset(existingUser.avatar.public_id);
                }

                const avatar = {
                    url: req.file.path,
                    public_id: req.file.filename,
                };

                const updatedUser = await userRepository.updateAvatar(userId, avatar);

                if (!updatedUser) {
                    return res.status(404).json({ message: 'User not found' });
                }

                return res.status(200).json({
                    _id: updatedUser._id,
                    email: updatedUser.email,
                    displayName: updatedUser.displayName,
                    bio: updatedUser.bio,
                    isVerified: updatedUser.isVerified,
                    avatar: updatedUser.avatar,
                });
            } catch (error) {
                next(error);
            }
        });
    }
}

module.exports = new UserController();
