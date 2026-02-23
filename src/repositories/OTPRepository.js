const OTP = require('../models/OTP');

class OTPRepository {
    async create({ email, otpCode, expiresAt }) {
        return OTP.create({ email, otpCode, expiresAt });
    }

    async findByEmail(email) {
        return OTP.findOne({ email }).sort({ createdAt: -1 });
    }

    async incrementAttempts(id) {
        return OTP.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { new: true });
    }

    async deleteByEmail(email) {
        return OTP.deleteMany({ email });
    }
}

module.exports = new OTPRepository();
