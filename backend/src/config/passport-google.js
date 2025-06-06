const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users');
const Role = require('../models/Roles');
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/reptitist/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ email: profile.emails[0].value });
            if (!user) {
                user = await User.create({
                    username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
                    email: profile.emails[0].value,
                    password_hashed: 'google_auth_' + profile.id, // Placeholder password
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