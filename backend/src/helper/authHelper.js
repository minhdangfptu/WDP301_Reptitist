const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const getUserInfoFromToken = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Authorization header missing or invalid');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id).populate('role_id');
        if (!user) {
            throw new Error('User not found');
        }

        return {
            user_id: user._id,
            role_name: user.role_id?.role_name || 'unknown'
        };
    } catch (error) {
        throw new Error('Failed to extract user info: ' + error.message);
    }
};

module.exports = {
    getUserInfoFromToken
};
