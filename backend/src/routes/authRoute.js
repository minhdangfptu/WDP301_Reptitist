const express = require('express');
const {signup, login, refreshToken, logout} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/Users');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Route để lấy thông tin profile user (cần authentication)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password_hashed -refresh_tokens -__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;