const User = require('../models/users');
const jwt = require('jsonwebtoken');
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers('Authorization')?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied!No token provided.' });
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password_hashed -__v');
        if (!req.user) {
            return res.status(401).json({ message: 'Invalid token!' });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
module.exports = authMiddleware;