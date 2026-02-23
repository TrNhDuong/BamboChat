const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
    console.warn('⚠️ Google OAuth credentials missing in .env. Google login will not be available.');
} else {
    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL: '/api/auth/google/callback',
                proxy: true,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const googleId = profile.id;
                    const displayName = profile.displayName;

                    // 1. Check if user exists with this googleId
                    let user = await User.findOne({ googleId });
                    if (user) {
                        return done(null, user);
                    }

                    // 2. Check if user exists with this email
                    user = await User.findOne({ email });
                    if (user) {
                        // Link Google account
                        user.googleId = googleId;
                        if (!user.displayName) user.displayName = displayName;
                        user.isVerified = true;
                        await user.save();
                        return done(null, user);
                    }

                    // 3. Create new user
                    // For BamboChat, we use string IDs. We'll derive a unique ID from email or use a random one.
                    const newUserId = `google_${googleId.substring(0, 10)}_${Math.random().toString(36).substring(2, 7)}`;

                    user = await User.create({
                        _id: newUserId,
                        email,
                        googleId,
                        displayName,
                        isVerified: true,
                        passwordHash: 'oauth_provided' // Placeholder as they won't use password login for this
                    });

                    return done(null, user);
                } catch (err) {
                    return done(err, null);
                }
            }
        )
    );

    // No session strategy needed for pure JWT flow, but passport requires these if used with middleware
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
}

module.exports = passport;
