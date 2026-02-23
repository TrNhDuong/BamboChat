const userRepository = require('../repositories/UserRepository');
const otpRepository = require('../repositories/OTPRepository');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { sendMail } = require('../utils/email');
const logger = require('../utils/logger');

class AuthService {
    /**
     * Register a new user.
     * Hash password, create user (is_verified=false), generate OTP.
     */
    async register({ id, email, password }) {
        // Check if user ID already exists
        const existingUser = await userRepository.findById(id);
        if (existingUser) {
            throw { status: 409, message: 'User ID already taken' };
        }

        // Check if email already exists
        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw { status: 409, message: 'Email already registered' };
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const user = await userRepository.create({ id, email, passwordHash });

        // Generate OTP (6-digit code, expires in 2 minutes)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
        await otpRepository.create({ email, otpCode, expiresAt });

        // Send OTP via Brevo
        try {
            await sendMail(
                email,
                'BamboChat - Your Verification Code',
                `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Chào mừng bạn đến với BamboChat!</h2>
                    <p>Mã xác minh (OTP) của bạn là:</p>
                    <div style="background: #f1f5f9; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 8px;">
                        ${otpCode}
                    </div>
                    <p>Mã này sẽ hết hạn sau 2 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #64748b;">Đây là email tự động, vui lòng không trả lời.</p>
                </div>
                `
            );
            logger.info(`OTP sent to email: ${email}`);
        } catch (error) {
            logger.error(`Failed to send OTP email to ${email}:`, { error: error.message });
        }

        logger.info(`User registered: ${id}`, { userId: user._id });

        return {
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user._id,
        };
    }

    /**
     * Verify OTP code.
     * Check expires_at and attempts, update is_verified=true.
     */
    async verifyOTP({ email, otpCode }) {
        const otp = await otpRepository.findByEmail(email);

        if (!otp) {
            throw { status: 404, message: 'No OTP found for this email' };
        }

        // Check if expired
        if (new Date() > otp.expiresAt) {
            throw { status: 400, message: 'OTP has expired' };
        }

        // Check attempts (max 5)
        if (otp.attempts >= 5) {
            throw { status: 429, message: 'Too many failed attempts. Request a new OTP.' };
        }

        // Check if OTP matches
        if (otp.otpCode !== otpCode) {
            await otpRepository.incrementAttempts(otp._id);
            throw { status: 400, message: 'Invalid OTP code' };
        }

        // OTP is valid — verify user and clean up
        const user = await userRepository.findByEmail(email);
        if (user) {
            await userRepository.updateVerified(user._id, true);
        }
        await otpRepository.deleteByEmail(email);

        logger.info(`Email verified successfully: ${email}`);

        return { message: 'Email verified successfully' };
    }

    /**
     * Login user.
     * Validate ID/Password, generate JWT Access Token & Refresh Token.
     */
    async login({ id, password }) {
        const user = await userRepository.findById(id);

        if (!user) {
            throw { status: 401, message: 'Invalid credentials' };
        }

        if (!user.isVerified) {
            throw { status: 403, message: 'Email not verified. Please verify your email first.' };
        }

        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) {
            logger.warn(`Login failed: Invalid password for user ID ${id}`);
            throw { status: 401, message: 'Invalid credentials' };
        }

        logger.info(`User logged in: ${id}`, { userId: user._id });

        const payload = { userId: user._id, email: user.email };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
            },
        };
    }
}

module.exports = new AuthService();
