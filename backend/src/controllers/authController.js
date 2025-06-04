const User = require('../models/users');
const Cart = require('../models/Carts');
const Role = require('../models/Roles');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

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
                role: existUser.role_id ? existUser.role_id.role_name : 'customer'
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

module.exports = {
    signup,
    login, 
    refreshToken,
    logout,
    changePassword,
    changePasswordWithEmail
}