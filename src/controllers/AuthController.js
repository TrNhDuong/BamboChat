const authService = require('../services/AuthService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

class AuthController {
    async register(req, res, next) {
        try {
            const { id, email, password } = req.body;

            if (!id || !email || !password) {
                return res.status(400).json({ message: 'id, email, and password are required' });
            }

            const result = await authService.register({ id, email, password });
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const { email, otpCode } = req.body;

            if (!email || !otpCode) {
                return res.status(400).json({ message: 'email and otpCode are required' });
            }

            const result = await authService.verifyOTP({ email, otpCode });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { id, password } = req.body;

            if (!id || !password) {
                return res.status(400).json({ message: 'id and password are required' });
            }

            const result = await authService.login({ id, password });
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async googleCallback(req, res) {
        // req.user is populated by passport
        const user = req.user;
        const payload = { userId: user._id, email: user.email };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Redirect to frontend with tokens
        // Adjust the frontend URL as needed
        const frontendUrl = 'http://localhost:5173/google-callback';
        res.redirect(`${frontendUrl}?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user._id}&email=${user.email}`);
    }
}

module.exports = new AuthController();
