const User = require('../models/users');
const Cart = require('../models/Carts');
const Role = require('../models/Roles');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const DEFAULTS = require('../constants/defaults');

const fs = require('fs');
console.log(fs.readdirSync(__dirname + '/../models'));

const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if username already exists
        const username_existing = await User.findOne({ username });
        if (username_existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        
        // Check if email already exists
        const email_existing = await User.findOne({ email });
        if (email_existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const role = await Role.findOne({ role_name: 'customer' });
        if (!role) {
            return res.status(400).json({ message: 'Role not found' });
        }
        
        const user = new User({
            username,
            email,
            password_hashed: hashedPassword,
            role_id: role._id,
            user_imageurl: '/default-avatar.png' // Default avatar path
        });
        
        await user.save();
        
        // Create cart for user
        const cart = new Cart({
            user_id: user._id
        });
        await cart.save();
        
        res.status(201).json({ message: 'Sign up successfully!' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: 'Failed to sign up!',
            error: error.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Support login with both username and email
        let existUser;
        if (email) {
            existUser = await User.findOne({ email }).populate('role_id');
        } else if (username) {
            existUser = await User.findOne({ username }).populate('role_id');
        } else {
            return res.status(400).json({ message: 'Username or email is required!' });
        }
        
        if (!existUser) {
            return res.status(404).json({ message: 'Username/email or password is incorrect!' });
        }
        
        // Compare hashed password
        const isMatch = await bcrypt.compare(password, existUser.password_hashed);
        if (!isMatch) {
            return res.status(400).json({ message: 'Username/email or password is incorrect!' });
        }
        
        const access_token = jwt.sign(
            { id: existUser._id },
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: '7d'
            }
        );
        
        const refresh_token = jwt.sign(
            { id: existUser._id },
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: '30d'
            }
        );
        
        const refresh_token_hashed = crypto.createHash('sha256').update(refresh_token).digest('hex');
        const expires_at = new Date(Date.now() + 30*24*60*60*1000);
        
        existUser.refresh_tokens.push({
            hashed_token: refresh_token_hashed,
            expires_at: expires_at,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip,
        });
        
        await existUser.save();
        
        res.status(200).json({
            message: 'Login successfully!',
            access_token: access_token,
            refresh_token: refresh_token,
            user: {
                id: existUser._id,
                username: existUser.username,
                email: existUser.email,
                role: existUser.role_id ? existUser.role_id.role_name : 'customer',
                // Thêm các thông tin khác nếu cần
                fullname: existUser.fullname,
                phone_number: existUser.phone_number,
                address: existUser.address,
                user_imageurl: existUser.user_imageurl,
                isActive: existUser.isActive,
                wallet: existUser.wallet,
                account_type: existUser.account_type
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to login!' });
    }
}

const refreshToken = async (req,res) => {
    try{
        const {refresh_token} = req.body;
        if(!refresh_token){
            return res.status(400).json({message: 'Refresh token is required!'});
        }
        const hashed_token = crypto.createHash('sha256').update(refresh_token).digest('hex');

        // Find user with the valid hashed refresh token
        const user = await User.findOne({
            refresh_tokens: {
                $elemMatch:{
                    hashed_token: hashed_token,
                    is_revoked: false,
                    expires_at: {
                        $gt: Date.now(),
                    },
                }
            }
        });

        if(!user){
            return res.status(403).json({message: 'Refresh token is not valid or expired!'});
        }
        
        // Generate new access token
        const access_token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: '7d'
            }
        );
        res.status(200).json({
            message: 'Refresh access token successfully!',
            access_token: access_token,
        });
    }catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to refresh token!' });
    }
};

const logout = async (req,res) => {
    try {
        const {refresh_token} = req.body;
        if(!refresh_token){
            return res.status(400).json({message: 'Refresh token is required!'});
        }
        const hashed_token = crypto.createHash('sha256').update(refresh_token).digest('hex');
        // Find user with the valid hashed refresh token
        const user = await User.findOne({
            refresh_tokens: {
                $elemMatch:{
                    hashed_token: hashed_token,
                    is_revoked: false,
                    expires_at: {
                        $gt: Date.now(),
                    },
                }
            }
        });
        if(!user){
            return res.status(403).json({message: 'Refresh token is not valid or expired!'});
        }
        // Revoke refresh token
        user.refresh_tokens = user.refresh_tokens.map(token => {
            if(token.hashed_token === hashed_token){
                token.is_revoked = true;
            }
            return token;
        });
        await user.save();
        res.status(200).json({message: 'Logout successfully!'});

    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Failed to logout!'});
    }
}

// New endpoint specifically for changing password without current password
const changePasswordWithEmail = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user._id;

        // Validate new password
        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        if (!/(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least 1 uppercase letter and 1 number' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password_hashed = hashedPassword;
        await user.save();

        // Revoke all refresh tokens to force re-login
        user.refresh_tokens = user.refresh_tokens.map(token => ({
            ...token,
            is_revoked: true
        }));
        await user.save();

        res.status(200).json({ message: 'Password changed successfully. Please login again.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hashed);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password_hashed = hashedPassword;
        await user.save();

        // Revoke all refresh tokens
        user.refresh_tokens = [];
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to change password' });
    }
};

// Helper function to validate base64 image
const validateBase64Image = (base64String) => {
    try {
        // Check if it's a valid base64 string
        if (!base64String || typeof base64String !== 'string') {
            return { isValid: false, error: 'Invalid base64 string' };
        }

        // Extract the data part (remove data:image/...;base64, prefix if present)
        const base64Data = base64String.includes(',') ? base64String.split(',')[1] : base64String;
        
        // Validate base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(base64Data)) {
            return { isValid: false, error: 'Invalid base64 format' };
        }

        // Check file size (limit to 5MB)
        const sizeInBytes = (base64Data.length * 3) / 4;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (sizeInBytes > maxSize) {
            return { isValid: false, error: 'File size too large (max 5MB)' };
        }

        // Validate image type from header
        const imageTypeRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
        if (base64String.includes('data:') && !imageTypeRegex.test(base64String)) {
            return { isValid: false, error: 'Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed' };
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, error: 'Error validating image' };
    }
};

// Updated upload avatar function to save base64 directly to MongoDB
const uploadAvatar = async (req, res) => {
    try {
        const { imageData } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!imageData) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Validate base64 image
        const validation = validateBase64Image(imageData);
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.error });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Save base64 image data directly to user document
        user.user_imageurl = imageData;
        await user.save();

        // Return success response
        res.status(200).json({
            message: 'Avatar uploaded successfully',
            imageUrl: imageData
        });

    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ 
            message: 'Error uploading avatar', 
            error: error.message 
        });
    }
};

module.exports = {
    signup,
    login, 
    refreshToken,
    logout,
    changePassword,
    changePasswordWithEmail,
    uploadAvatar
}