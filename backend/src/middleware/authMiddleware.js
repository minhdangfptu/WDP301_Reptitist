const User = require('../models/users');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Access denied. No token provided.',
                success: false 
            });
        }

        // Tách token từ "Bearer tokenValue"
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Access denied. Invalid token format.',
                success: false 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Tìm user và populate role
        const user = await User.findById(decoded.id)
            .select('-password_hashed -refresh_tokens -__v')
            .populate('role_id', 'role_name role_description');
        
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid token. User not found.',
                success: false 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Account is deactivated.',
                success: false 
            });
        }

        // Thêm user info vào request
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token.',
                success: false 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired.',
                success: false 
            });
        }
        
        return res.status(500).json({ 
            message: 'Internal server error.',
            success: false 
        });
    }
};

module.exports = authMiddleware;