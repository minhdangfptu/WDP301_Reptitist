const jwt = require('jsonwebtoken');
const User = require('../models/Users');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = authHeader?.split(' ')[1];

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
        console.error(error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authMiddleware;
