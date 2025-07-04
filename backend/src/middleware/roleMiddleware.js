const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user) {
            return res.status(403).json({ 
                message: 'Access denied: User not found',
                success: false 
            });
        }

        // Get role from role_id (primary system)
        const userRole = user.role_id?.role_name;
        
        // Get account type (secondary system)
        const accountType = user.account_type?.type;
        
        // Debug logging
        console.log('Role Middleware Debug:', {
            userId: user._id,
            username: user.username,
            userRole: userRole,
            accountType: accountType,
            allowedRoles: allowedRoles,
            roleId: user.role_id
        });

        // Account type to role mapping (based on your user model)
        const accountTypeMapping = {
            1: 'customer',    // Basic user
            2: 'premium',     // Premium user  
            3: 'shop',        // Shop owner
            4: 'admin'        // Administrator
        };

        // Get mapped role from account type
        const mappedAccountType = accountTypeMapping[accountType];

        // Check access through role_id system
        if (userRole && allowedRoles.includes(userRole)) {
            console.log(`Access granted via role_id: ${userRole}`);
            return next();
        }

        // Check access through account_type system
        if (mappedAccountType && allowedRoles.includes(mappedAccountType)) {
            console.log(`Access granted via account_type: ${mappedAccountType}`);
            return next();
        }

        // Special handling for admin access
        if (allowedRoles.includes('admin')) {
            // Check if user is admin through role_id
            if (userRole === 'admin') {
                console.log('Admin access granted via role_id');
                return next();
            }
            
            // Check if user is admin through account_type
            if (accountType === 4) {
                console.log('Admin access granted via account_type');
                return next();
            }
        }

        // Special handling for shop access
        if (allowedRoles.includes('shop')) {
            if (userRole === 'shop' || accountType === 3) {
                console.log('Shop access granted');
                return next();
            }
        }

        // Special handling for customer access
        if (allowedRoles.includes('customer')) {
            if (userRole === 'customer' || userRole === 'user' || accountType === 1) {
                console.log('Customer access granted');
                return next();
            }
        }

        // Access denied
        console.log('Access denied:', {
            userRole,
            accountType,
            mappedAccountType,
            allowedRoles,
            reason: 'No matching role found'
        });

        return res.status(403).json({ 
            message: 'Access denied: insufficient permissions',
            success: false,
            debug: process.env.NODE_ENV === 'development' ? {
                userRole: userRole,
                accountType: accountType,
                mappedAccountType: mappedAccountType,
                requiredRoles: allowedRoles
            } : undefined
        });
    };
};

module.exports = roleMiddleware;