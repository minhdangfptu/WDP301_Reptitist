const User = require('../models/users');
const Role = require('../models/Roles');
const Product = require('../models/Products');
const ProductReport = require('../models/Product_reports');
const mongoose = require('mongoose');
const { sendProductReportNotification, sendProductUnhideNotification, sendProductDeleteNotification, sendProductHideNotification } = require('../config/email');

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

// Lấy tất cả Shop
const getAllShops = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const shopRole = await Role.findOne({ role_name: 'shop' });
        if (!shopRole) {
            return res.status(404).json({ message: 'Không tìm thấy role shop' });
        }

        const query = { role_id: shopRole._id };
        
        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const shops = await User.find(query)
            .populate('role_id', 'role_name role_description')
            .select('-password_hashed -refresh_tokens')
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        if (!shops || shops.length === 0) {
            return res.status(404).json({ message: 'Không có shop nào' });
        }

        const total = await User.countDocuments(query);

        // Lấy thống kê sản phẩm cho mỗi shop
        const shopsWithStats = await Promise.all(shops.map(async (shop) => {
            const productCount = await Product.countDocuments({ user_id: shop._id });
            const reportedCount = await Product.countDocuments({ 
                user_id: shop._id, 
                product_status: 'reported' 
            });
            
            return {
                ...shop.toObject(),
                productCount,
                reportedCount
            };
        }));

        res.status(200).json({
            shops: shopsWithStats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all shops error:', error);
        res.status(500).json({
            message: 'Không thể lấy danh sách shop',
            error: error.message
        });
    }
};

// Lấy sản phẩm của một Shop cụ thể
const getShopProducts = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { page = 1, limit = 10, status, category } = req.query;

        // Kiểm tra shop có tồn tại không
        const shop = await User.findById(shopId).populate('role_id');
        if (!shop || shop.role_id?.role_name !== 'shop') {
            return res.status(404).json({ message: 'Không tìm thấy shop' });
        }

        const query = { user_id: shopId };
        
        if (status && status !== 'all') {
            query.product_status = status;
        }
        
        if (category && category !== 'all') {
            query.product_category_id = category;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await Product.find(query)
            .populate('product_category_id', 'product_category_name')
            .populate('user_id', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            shop: {
                _id: shop._id,
                username: shop.username,
                email: shop.email,
                isActive: shop.isActive
            },
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get shop products error:', error);
        res.status(500).json({
            message: 'Không thể lấy sản phẩm của shop',
            error: error.message
        });
    }
};

// Xóa sản phẩm (chỉ admin)
const deleteProductByAdmin = async (req, res) => {
    try {
        const { productId } = req.params;
        const { deleteReason } = req.body; // Lý do xóa (tùy chọn)

        const product = await Product.findById(productId).populate('user_id', 'username email');
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Lưu thông tin sản phẩm trước khi xóa để gửi email
        const productInfo = {
            _id: product._id,
            product_name: product.product_name,
            shop: product.user_id
        };

        await Product.findByIdAndDelete(productId);

        // Gửi email thông báo cho chủ shop
        try {
            if (product.user_id && product.user_id.email) {
                const emailResult = await sendProductDeleteNotification(
                    product.user_id.email,
                    product.user_id.username || 'Chủ shop',
                    product.product_name,
                    req.user.username || 'Admin',
                    deleteReason
                );
                
                if (emailResult.success) {
                    console.log('Product delete email sent successfully to shop owner');
                } else {
                    console.error('Failed to send product delete email:', emailResult.error);
                }
            } else {
                console.warn('Shop email not found for product:', productId);
            }
        } catch (emailError) {
            console.error('Error sending product delete email:', emailError);
            // Không throw error để không ảnh hưởng đến việc xóa sản phẩm
        }

        res.status(200).json({
            message: 'Xóa sản phẩm thành công',
            deletedProduct: productInfo,
            emailSent: product.user_id && product.user_id.email ? true : false
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            message: 'Không thể xóa sản phẩm',
            error: error.message
        });
    }
};

// Lấy tất cả báo cáo sản phẩm
const getAllProductReports = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, reason } = req.query;
        
        const query = {};
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (reason && reason !== 'all') {
            query.reason = reason;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const reports = await ProductReport.find(query)
            .populate('product_id', 'product_name product_imageurl')
            .populate('reporter_id', 'username email')
            .populate('shop_id', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ProductReport.countDocuments(query);

        res.status(200).json({
            reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            message: 'Không thể lấy danh sách báo cáo',
            error: error.message
        });
    }
};

// Xử lý báo cáo sản phẩm
const handleProductReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { action, adminNote } = req.body; // action: 'approve', 'reject'

        const report = await ProductReport.findById(reportId)
            .populate('product_id')
            .populate('shop_id', 'username email');

        if (!report) {
            return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
        }

        if (report.status !== 'pending') {
            return res.status(400).json({ message: 'Báo cáo này đã được xử lý' });
        }

        if (action === 'approve') {
            // Chấp nhận báo cáo - xóa sản phẩm hoặc chuyển về pending
            await Product.findByIdAndUpdate(report.product_id._id, {
                product_status: 'not_available'
            });

            await ProductReport.findByIdAndUpdate(reportId, {
                status: 'approved',
                admin_note: adminNote,
                resolved_at: new Date(),
                resolved_by: req.user._id
            });

            // Gửi email thông báo cho chủ shop
            try {
                if (report.shop_id && report.shop_id.email) {
                    const emailResult = await sendProductReportNotification(
                        report.shop_id.email,
                        report.shop_id.username || 'Chủ shop',
                        report.product_id.product_name,
                        report.reason,
                        adminNote
                    );
                    
                    if (emailResult.success) {
                        console.log('Email notification sent successfully to shop owner');
                    } else {
                        console.error('Failed to send email notification:', emailResult.error);
                    }
                } else {
                    console.warn('Shop email not found for report:', reportId);
                }
            } catch (emailError) {
                console.error('Error sending email notification:', emailError);
                // Không throw error để không ảnh hưởng đến việc xử lý báo cáo
            }

            res.status(200).json({
                message: 'Đã chấp nhận báo cáo và ẩn sản phẩm',
                action: 'approved',
                emailSent: report.shop_id && report.shop_id.email ? true : false
            });
        } else if (action === 'reject') {
            // Từ chối báo cáo - khôi phục sản phẩm
            await Product.findByIdAndUpdate(report.product_id._id, {
                product_status: 'available'
            });

            // Xóa báo cáo sau khi từ chối
            await ProductReport.findByIdAndDelete(reportId);

            res.status(200).json({
                message: 'Đã từ chối báo cáo và khôi phục sản phẩm',
                action: 'rejected'
            });
        } else {
            return res.status(400).json({ message: 'Hành động không hợp lệ' });
        }
    } catch (error) {
        console.error('Handle report error:', error);
        res.status(500).json({
            message: 'Không thể xử lý báo cáo',
            error: error.message
        });
    }
};

// Thống kê tổng quan cho Admin
const getAdminStats = async (req, res) => {
    try {
        // Thống kê người dùng
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        // Thống kê theo roles
        const adminRole = await Role.findOne({ role_name: 'admin' });
        const shopRole = await Role.findOne({ role_name: 'shop' });
        const customerRole = await Role.findOne({ role_name: 'customer' });
        
        const adminCount = adminRole ? await User.countDocuments({ role_id: adminRole._id }) : 0;
        const shopCount = shopRole ? await User.countDocuments({ role_id: shopRole._id }) : 0;
        const customerCount = customerRole ? await User.countDocuments({ role_id: customerRole._id }) : 0;
        
        // Thống kê sản phẩm
        const totalProducts = await Product.countDocuments();
        const availableProducts = await Product.countDocuments({ product_status: 'available' });
        const reportedProducts = await Product.countDocuments({ product_status: 'reported' });
        const notAvailableProducts = await Product.countDocuments({ product_status: 'not_available' });
        
        // Thống kê báo cáo
        const totalReports = await ProductReport.countDocuments();
        const pendingReports = await ProductReport.countDocuments({ status: 'pending' });
        const approvedReports = await ProductReport.countDocuments({ status: 'approved' });
        const rejectedReports = await ProductReport.countDocuments({ status: 'rejected' });
        
        // Đăng ký mới trong 30 ngày
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRegistrations = await User.countDocuments({
            created_at: { $gte: thirtyDaysAgo }
        });
        
        // Báo cáo mới trong 7 ngày
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentReports = await ProductReport.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const stats = {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: inactiveUsers,
                roles: {
                    admin: adminCount,
                    shop: shopCount,
                    customer: customerCount
                },
                recentRegistrations
            },
            products: {
                total: totalProducts,
                available: availableProducts,
                reported: reportedProducts,
                notAvailable: notAvailableProducts
            },
            reports: {
                total: totalReports,
                pending: pendingReports,
                approved: approvedReports,
                rejected: rejectedReports,
                recent: recentReports
            }
        };
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            message: 'Không thể lấy thống kê',
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

        // Handle account_type update if provided
        if (req.body.account_type) {
            updateData.account_type = {
                type: req.body.account_type.type || 'customer',
                level: req.body.account_type.level || 'normal',
                activated_at: req.body.account_type.activated_at || new Date(),
                expires_at: req.body.account_type.expires_at || null
            };
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

        // If deleting a shop, also delete their products
        if (user.role_id && user.role_id.role_name === 'shop') {
            await Product.deleteMany({ user_id: userId });
            await ProductReport.deleteMany({ shop_id: userId });
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

        // If deactivating a shop, hide their products
        if (user.role_id && user.role_id.role_name === 'shop' && !isActive) {
            await Product.updateMany(
                { user_id: userId },
                { product_status: 'not_available' }
            );
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
            isActive: true,
            user_imageurl: '/default-avatar.png' // Default avatar path
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

// Cập nhật loại tài khoản người dùng (admin)
const updateUserAccountType = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, level, expires_at } = req.body;

        // Validate input
        if (!type || !level) {
            return res.status(400).json({ 
                message: 'Loại tài khoản và cấp độ không được để trống' 
            });
        }

        // Validate account type
        const validTypes = ['customer', 'premium', 'vip'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ 
                message: 'Loại tài khoản không hợp lệ. Các loại hợp lệ: customer, premium, vip' 
            });
        }

        // Validate account level
        const validLevels = ['normal', 'silver', 'gold', 'platinum'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({ 
                message: 'Cấp độ tài khoản không hợp lệ. Các cấp độ hợp lệ: normal, silver, gold, platinum' 
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Update account type
        const updateData = {
            account_type: {
                type,
                level,
                activated_at: new Date(),
                expires_at: expires_at || null
            }
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).populate('role_id', 'role_name role_description')
         .select('-password_hashed -refresh_tokens');

        res.status(200).json({
            message: 'Cập nhật loại tài khoản thành công',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update account type error:', error);
        res.status(500).json({
            message: 'Không thể cập nhật loại tài khoản',
            error: error.message
        });
    }
};

// Lấy sản phẩm bị ẩn (not_available)
const getHiddenProducts = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) {
            filter.product_status = status;
        }
        const products = await Product.find(filter).populate('user_id', 'username');
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Admin cập nhật trạng thái sản phẩm
const updateProductStatusByAdmin = async (req, res) => {
    try {
        const { productId } = req.params;
        const { product_status, hideReason } = req.body;
        if (!product_status) {
            return res.status(400).json({ message: 'Thiếu trạng thái sản phẩm' });
        }

        // Lấy thông tin sản phẩm và shop trước khi cập nhật
        const product = await Product.findById(productId).populate('user_id', 'username email');
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Nếu chuyển sang not_available mà không có lý do thì báo lỗi
        if (product_status === 'not_available' && (!hideReason || hideReason.trim() === '')) {
            return res.status(400).json({ message: 'Vui lòng nhập lý do ẩn sản phẩm' });
        }

        // Cập nhật trạng thái sản phẩm
        const updatedProduct = await Product.findByIdAndUpdate(productId, { product_status }, { new: true });

        let emailSent = false;
        // Nếu chuyển sang available (gỡ bỏ ẩn), gửi email thông báo cho shop
        if (product_status === 'available' && product.user_id && product.user_id.email) {
            try {
                const emailResult = await sendProductUnhideNotification(
                    product.user_id.email,
                    product.user_id.username || 'Chủ shop',
                    product.product_name,
                    req.user.username || 'Admin'
                );
                if (emailResult.success) {
                    emailSent = true;
                    console.log('Email notification sent successfully to shop owner for product unhide');
                } else {
                    console.error('Failed to send email notification for product unhide:', emailResult.error);
                }
            } catch (emailError) {
                console.error('Error sending email notification for product unhide:', emailError);
            }
        }
        // Nếu chuyển sang not_available (ẩn), gửi email thông báo cho shop, truyền lý do
        if (product_status === 'not_available' && product.user_id && product.user_id.email) {
            try {
                const emailResult = await sendProductHideNotification(
                    product.user_id.email,
                    product.user_id.username || 'Chủ shop',
                    product.product_name,
                    req.user.username || 'Admin',
                    hideReason
                );
                if (emailResult.success) {
                    emailSent = true;
                    console.log('Email notification sent successfully to shop owner for product hide');
                } else {
                    console.error('Failed to send email notification for product hide:', emailResult.error);
                }
            } catch (emailError) {
                console.error('Error sending email notification for product hide:', emailError);
            }
        }

        // Nếu chuyển sang available, xóa các báo cáo đã duyệt liên quan
        if (product_status === 'available') {
            await ProductReport.deleteMany({ product_id: productId, status: 'approved' });
        }

        res.status(200).json({ 
            message: 'Cập nhật trạng thái thành công', 
            product: updatedProduct,
            emailSent
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Export controller functions
module.exports = {
    checkAdminRole,
    getAllUsers,
    getAllShops,
    getShopProducts,
    deleteProductByAdmin,
    getAllProductReports,
    handleProductReport,
    getAdminStats,
    searchUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    createUser,
    updateUserAccountType,
    getHiddenProducts,
    updateProductStatusByAdmin
};