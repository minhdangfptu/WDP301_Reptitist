const express = require('express');
const {signup, login, refreshToken, logout, changePassword, changePasswordWithEmail} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/users');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

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

// Route để upload avatar
router.post('/upload-avatar', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old avatar if exists
    const user = await User.findById(req.user._id);
    if (user.user_imageurl) {
      const oldAvatarPath = path.join(__dirname, '../../', user.user_imageurl);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user's avatar URL - Fix the URL format
    const avatarUrl = `/uploads/avatars/${req.file.filename}`; // Use the filename from multer
    user.user_imageurl = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      imageUrl: avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
});

module.exports = router;