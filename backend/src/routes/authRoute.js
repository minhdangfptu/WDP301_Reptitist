const express = require('express');
const {signup, login, refreshToken, logout, changePassword, changePasswordWithEmail} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/users');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/change-password', authMiddleware, changePassword);
router.post('/change-password-email', authMiddleware, changePasswordWithEmail);

// Route để lấy thông tin profile user (cần authentication)
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
            role: user.role_id ? user.role_id.role_name : 'customer',
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
            role: user.role_id ? user.role_id.role_name : 'customer',
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        res.json(userResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;