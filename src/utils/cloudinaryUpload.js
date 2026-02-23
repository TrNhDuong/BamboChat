const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'bambochat/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
    },
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('avatar');

const destroyCloudinaryAsset = async (publicId) => {
    if (!publicId) return;
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== 'ok' && result.result !== 'not found') {
            console.error(`Cloudinary deletion failed for ${publicId}:`, result);
        }
    } catch (err) {
        console.error('Error deleting Cloudinary asset:', err);
    }
};

module.exports = { uploadAvatar, destroyCloudinaryAsset };
