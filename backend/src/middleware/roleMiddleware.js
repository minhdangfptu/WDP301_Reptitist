const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const accountType = req.user?.account_type?.type;

        if (!accountType || !allowedRoles.includes(accountType)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

module.exports = roleMiddleware;