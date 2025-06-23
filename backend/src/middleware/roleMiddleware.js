const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const roleName = req.user?.role_id?.role_name;

        if (!roleName || !allowedRoles.includes(roleName)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

module.exports = roleMiddleware;
