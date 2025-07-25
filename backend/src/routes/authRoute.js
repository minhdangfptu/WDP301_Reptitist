const express = require('express');
const {signup, login, refreshToken, logout, changePassword, changePasswordWithEmail, uploadAvatar} = require('../controllers/authController');
const {authMiddleware} = require('../middleware/authMiddleware');
const User = require('../models/users');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const Role = require('../models/Roles');

const router = express.Router();
require('../config/passport-google'); // Import Google OAuth configuration

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/change-password', authMiddleware, changePassword);
router.post('/change-password-email', authMiddleware, changePasswordWithEmail);
router.post('/upload-avatar', authMiddleware, uploadAvatar);

// Route để lấy thông tin profile user 
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password_hashed -refresh_tokens -__v')
            .populate('role_id', 'role_name role_description');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format response to match frontend expectations
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            phone_number: user.phone_number,
            address: user.address,
            wallet: user.wallet,
            account_type: user.account_type,
            user_imageurl: user.user_imageurl,
            isActive: user.isActive,
            role: user.role_id ? user.role_id.role_name : 'user', // Đảm bảo luôn có trường role
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route để cập nhật thông tin profile user
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { fullname, phone_number, address } = req.body;
        
        const updateData = {};
        if (fullname !== undefined) updateData.fullname = fullname;
        if (phone_number !== undefined) updateData.phone_number = phone_number;
        if (address !== undefined) updateData.address = address;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password_hashed -refresh_tokens -__v')
         .populate('role_id', 'role_name role_description');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format response to match frontend expectations
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            phone_number: user.phone_number,
            address: user.address,
            wallet: user.wallet,
            account_type: user.account_type,
            user_imageurl: user.user_imageurl,
            isActive: user.isActive,
            role: user.role_id ? user.role_id.role_name : 'user',
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const generateToken = (id) => jwt.sign({id}, process.env.JWT_SECRET,{expireIn :'7d'});
const generateRefreshToken = (id) => jwt.sign({id}, process.env.JWT_SECRET,{expireIn :'30d'}); 

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email']
}));

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=Authentication failed`
    }), 
    async (req, res) => {
        try {
            console.log('Google callback route handler started');
            const user = req.user;
            
            if (!user) {
                console.error('No user found in request after Google authentication');
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
            }

            console.log('User authenticated:', user._id);

            const accessToken = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            const refreshToken = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            console.log('Tokens generated for user:', user._id);

            // Store refresh token in user's refresh_tokens array
            const refreshTokenHashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
            user.refresh_tokens.push({ 
                hashed_token: refreshTokenHashed, 
                expires_at: Date.now() + 30 * 24 * 60 * 60 * 1000,
                user_agent: req.headers['user-agent'],
                ip_address: req.ip
            });
            await user.save();

            console.log('Refresh token stored for user:', user._id);

            // Redirect to frontend with tokens
            const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`;
            console.log('Redirecting to:', redirectUrl);
            res.redirect(redirectUrl);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
        }
    }
);

// Route to update user role and account type
router.put('/update-role', authMiddleware, async (req, res) => {
    try {
        const { role, account_type } = req.body;
        
        const updateData = {};
        
        // Update role if provided
        if (role) {
            const roleDoc = await Role.findOne({ role_name: role });
            if (!roleDoc) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            updateData.role_id = roleDoc._id;
        }
        
        // Update account type if provided
        if (account_type) {
            updateData.account_type = {
                type: account_type.type || 1, // Default to 1 (customer)
                activated_at: account_type.activated_at || new Date(),
                expires_at: account_type.expires_at || null
            };
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password_hashed -refresh_tokens -__v')
         .populate('role_id', 'role_name role_description');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Format response to match frontend expectations
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            phone_number: user.phone_number,
            address: user.address,
            wallet: user.wallet,
            account_type: user.account_type,
            user_imageurl: user.user_imageurl,
            isActive: user.isActive,
            role: user.role_id ? user.role_id.role_name : 'customer',
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;