const User = require('../models/users');
const jwt = require('jsonwebtoken');

const authMiddleware1 = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token) {
            return res.status(401).json({ message: 'Access denied! No token provided.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id)
            .populate('role_id')
            .select('-password_hashed -__v');

        if (!user) {
            return res.status(401).json({ message: 'Invalid token!' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware1;
