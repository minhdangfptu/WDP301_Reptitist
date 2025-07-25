const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users');
const Role = require('../models/Roles');
const Cart = require('../models/Carts');

// Determine the callback URL based on environment
const callbackURL = `${process.env.VITE_BACKEND_URL}/reptitist/auth/google/callback`;

async function generateUniqueUsername(baseName) {
    const normalized = baseName.toLowerCase().replace(/\s+/g, '');
    let username = normalized;
    let count = 1;

    // Loop until a unique username is found
    while (await User.findOne({ username })) {
        username = `${normalized}${count}`;
        count++;
    }

    return username;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
},

    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth callback received:', {
                email: profile.emails[0].value,
                displayName: profile.displayName
            });

            let user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                console.log('Creating new user from Google profile');
                const baseUsername = profile.displayName || 'googleuser';
                const uniqueUsername = await generateUniqueUsername(baseUsername);
                user = await User.create({
                    username: uniqueUsername,
                    email: profile.emails[0].value,
                    password_hashed: 'google_auth_' + profile.id, // Placeholder password
                    role_id: await Role.findOne({ role_name: 'user' }).then(role => role._id),
                    user_imageurl: profile.photos[0].value,
                    fullname: profile.displayName,
                });

                console.log('New user created:', user._id);

                const cart = await Cart.create({
                    user_id: user._id,
                    cart_items: []
                });
                console.log('New cart created for user:', cart._id);
            } else {
                console.log('Existing user found:', user._id);
            }

            return done(null, user);
        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
        }
    }
));

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user._id);
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user:', id);
        const user = await User.findById(id).populate('role_id');
        done(null, user);
    } catch (error) {
        console.error('Deserialize user error:', error);
        done(error, null);
    }
});