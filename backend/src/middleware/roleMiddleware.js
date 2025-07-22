const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role_id?.role_name || req.user?.role;
        const accountType = req.user?.account_type?.type;

        if (
            (userRole && allowedRoles.includes(userRole)) ||
            (accountType && allowedRoles.includes(accountType))
        ) {
            return next();
        }

        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    };
};

module.exports = roleMiddleware;