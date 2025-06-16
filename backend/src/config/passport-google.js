const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users');
const Role = require('../models/Roles');
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/reptitist/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                const rawName = profile.displayName || '';
                let username = rawName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                if (!username) {
                    username = profile.emails[0].value.split('@')[0];
                }
                if (username.length > 30) {
                    username = username.slice(0, 30);
                }

                user = await User.create({
                    username: username,
                    email: profile.emails[0].value,
                    password_hashed: 'google_auth_' + profile.id,
                    role_id: await Role.findOne({ role_name: 'user' }).then(role => role._id),
                    user_imageurl: profile.photos[0].value,
                    fullname: profile.displayName,
                });
            }
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));


passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).populate('role_id');
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});