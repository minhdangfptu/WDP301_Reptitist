const User = require('../models/users');
const Cart = require('../models/Carts');
const Role = require('../models/Roles');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const username_existing = await User.findOne({ username });
        if (username_existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const email_existing = await User.findOne({ email });
        if (email_existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const role = await Role.findOne({ role_name: 'user' });
        if (!role) {
            return res.status(400).json({ message: 'Role not found' });
        }
        const user = new User({
            username,
            email,
            password_hashed: password,
            role_id: role._id,
        });
        await user.save();
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
        const { username, password } = req.body;
        const existUser = await User.findOne({ username });
        if (!existUser) {
            return res.status(404).json({ message: 'Username or password is incorrect!' });
        }
        const isMatch = password === existUser.password_hashed;
        if (!isMatch) {
            return res.status(400).json({ message: 'Username or password is incorrect!' });
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
        const expires_at = new Date(Date.now()+ 30*24*60*60*1000);
        existUser.refresh_tokens.push({
            hashed_token: refresh_token_hashed,
            expires_at: expires_at,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip,
        });
        await existUser.save();
        res.status(200).json({
            message: 'Login successfully!',
            token: access_token,
            refresh_token: refresh_token,
            user: {
                id: existUser._id,
                username: existUser.username,
                email: existUser.email,
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

module.exports = {
    signup,
    login, 
    refreshToken,
    logout
}