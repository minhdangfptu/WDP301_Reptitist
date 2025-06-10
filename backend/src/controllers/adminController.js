const User = require('../models/users');
const Role = require('../models/Roles');

// Middleware kiểm tra quyền admin
const checkAdminRole = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || !user.role_id) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        const role = await Role.findById(user.role_id);
        if (!role || role.role_name !== 'admin') {
            return res.status(403).json({ message: 'Chỉ admin mới có quyền truy cập' });
        }

        next();
    } catch (error) {
        console.error('Admin role check error:', error);
        return res.status(500).json({ message: 'Lỗi kiểm tra quyền truy cập' });
    }
};

// Lấy tất cả người dùng (chỉ admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate('role_id', 'role_name role_description')
            .select('-password_hashed -refresh_tokens')
            .sort({ created_at: -1 });

        res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            message: 'Không thể lấy danh sách người dùng',
            error: error.message
        });
    }
};

// Lấy thông tin chi tiết một người dùng
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .populate('role_id', 'role_name role_description')
            .select('-password_hashed -refresh_tokens');

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get user by id error:', error);
        res.status(500).json({
            message: 'Không thể lấy thông tin người dùng',
            error: error.message
        });
    }
};

// Cập nhật thông tin người dùng (admin)
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email, fullname, phone_number, address, isActive, role } = req.body;

        // Validate input
        if (!username || !email) {
            return res.status(400).json({ message: 'Tên đăng nhập và email không được để trống' });
        }

        // Check if username already exists (excluding current user)
        const existingUsername = await User.findOne({ 
            username, 
            _id: { $ne: userId } 
        });
        if (existingUsername) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // Check if email already exists (excluding current user)
        const existingEmail = await User.findOne({ 
            email, 
            _id: { $ne: userId } 
        });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Find role by name
        let roleId = null;
        if (role) {
            const roleDoc = await Role.findOne({ role_name: role });
            if (!roleDoc) {
                return res.status(400).json({ message: 'Vai trò không hợp lệ' });
            }
            roleId = roleDoc._id;
        }

        // Update user
        const updateData = {
            username,
            email,
            fullname: fullname || '',
            phone_number: phone_number || '',
            address: address || '',
            isActive: isActive !== false
        };

        if (roleId) {
            updateData.role_id = roleId;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).populate('role_id', 'role_name role_description')
         .select('-password_hashed -refresh_tokens');

        if (!updatedUser) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            message: 'Cập nhật thông tin người dùng thành công',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            message: 'Không thể cập nhật thông tin người dùng',
            error: error.message
        });
    }
};

// Xóa người dùng (admin)
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === userId) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
        }

        // Check if user exists
        const user = await User.findById(userId).populate('role_id');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Prevent deleting other admin accounts
        if (user.role_id && user.role_id.role_name === 'admin') {
            return res.status(400).json({ message: 'Không thể xóa tài khoản admin khác' });
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            message: 'Xóa người dùng thành công',
            deletedUserId: userId
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            message: 'Không thể xóa người dùng',
            error: error.message
        });
    }
};

// Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        // Prevent admin from deactivating themselves
        if (req.user._id.toString() === userId && !isActive) {
            return res.status(400).json({ message: 'Không thể vô hiệu hóa tài khoản của chính mình' });
        }

        const user = await User.findById(userId).populate('role_id');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Prevent deactivating other admin accounts
        if (user.role_id && user.role_id.role_name === 'admin' && !isActive) {
            return res.status(400).json({ message: 'Không thể vô hiệu hóa tài khoản admin khác' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isActive: isActive },
            { new: true }
        ).populate('role_id', 'role_name role_description')
         .select('-password_hashed -refresh_tokens');

        res.status(200).json({
            message: `${isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`,
            user: updatedUser
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            message: 'Không thể thay đổi trạng thái tài khoản',
            error: error.message
        });
    }
};

// Thống kê tổng quan người dùng
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        // Count by roles
        const adminRole = await Role.findOne({ role_name: 'admin' });
        const shopRole = await Role.findOne({ role_name: 'shop' });
        const customerRole = await Role.findOne({ role_name: 'customer' });
        
        const adminCount = adminRole ? await User.countDocuments({ role_id: adminRole._id }) : 0;
        const shopCount = shopRole ? await User.countDocuments({ role_id: shopRole._id }) : 0;
        const customerCount = customerRole ? await User.countDocuments({ role_id: customerRole._id }) : 0;
        
        // Count by account type
        const premiumUsers = await User.countDocuments({ 'account_type.type': 'premium' });
        const normalUsers = await User.countDocuments({ 'account_type.type': 'normal' });
        
        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            created_at: { $gte: thirtyDaysAgo }
        });
        
        // Calculate total wallet balance
        const walletStats = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: '$wallet.balance' },
                    avgBalance: { $avg: '$wallet.balance' }
                }
            }
        ]);
        
        const stats = {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            roles: {
                admin: adminCount,
                shop: shopCount,
                customer: customerCount
            },
            accountTypes: {
                premium: premiumUsers,
                normal: normalUsers
            },
            recentRegistrations,
            wallet: {
                total: walletStats[0]?.totalBalance || 0,
                average: walletStats[0]?.avgBalance || 0
            }
        };
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            message: 'Không thể lấy thống kê người dùng',
            error: error.message
        });
    }
};

// Tìm kiếm người dùng
const searchUsers = async (req, res) => {
    try {
        const { query, role, status, page = 1, limit = 10 } = req.query;
        
        // Build search criteria
        const searchCriteria = {};
        
        if (query) {
            searchCriteria.$or = [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { fullname: { $regex: query, $options: 'i' } }
            ];
        }
        
        if (role && role !== 'all') {
            const roleDoc = await Role.findOne({ role_name: role });
            if (roleDoc) {
                searchCriteria.role_id = roleDoc._id;
            }
        }
        
        if (status && status !== 'all') {
            searchCriteria.isActive = status === 'active';
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const users = await User.find(searchCriteria)
            .populate('role_id', 'role_name role_description')
            .select('-password_hashed -refresh_tokens')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await User.countDocuments(searchCriteria);
        
        res.status(200).json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            message: 'Không thể tìm kiếm người dùng',
            error: error.message
        });
    }
};

// Tạo người dùng mới (admin)
const createUser = async (req, res) => {
    try {
        const { username, email, password, fullname, phone_number, address, role = 'customer' } = req.body;
        
        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Tên đăng nhập, email và mật khẩu không được để trống' });
        }
        
        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        
        // Find role
        const roleDoc = await Role.findOne({ role_name: role });
        if (!roleDoc) {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }
        
        // Hash password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const newUser = new User({
            username,
            email,
            password_hashed: hashedPassword,
            fullname: fullname || '',
            phone_number: phone_number || '',
            address: address || '',
            role_id: roleDoc._id,
            isActive: true
        });
        
        await newUser.save();
        
        // Return user without password
        const userResponse = await User.findById(newUser._id)
            .populate('role_id', 'role_name role_description')
            .select('-password_hashed -refresh_tokens');
        
        res.status(201).json({
            message: 'Tạo người dùng mới thành công',
            user: userResponse
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            message: 'Không thể tạo người dùng mới',
            error: error.message
        });
    }
};

// Export controller functions
module.exports = {
    checkAdminRole,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserStats,
    searchUsers,
    createUser
};