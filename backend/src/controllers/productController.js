const Product = require('../models/Products');
const ProductCategory = require('../models/Products_categories');
const Feedback = require('../models/Product_feedback');
const ProductReport = require('../models/Product_reports');
const Order = require('../models/Orders'); // ✅ Thêm import Order model
const mongoose = require('mongoose');
const { successResponse } = require('../../utils/APIResponse');

// Helper function to update average rating
async function updateAverageRating(productId) {
  try {
    const feedbacks = await Feedback.find({ product_id: productId });
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = feedbacks.length > 0 ? totalRating / feedbacks.length : 0;

    await Product.findByIdAndUpdate(productId, {
      average_rating: averageRating,
      total_ratings: feedbacks.length
    });
  } catch (error) {
    console.error('Error updating average rating:', error);
  }
}

// Shop functions
const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      product_price,
      product_quantity,
      product_category_id,
      product_imageurl
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để tạo sản phẩm'
      });
    }

    // Validate required fields
    if (!product_name || !product_price || !product_quantity || !product_category_id) {
      return res.status(400).json({
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Check if category exists
    const category = await ProductCategory.findById(product_category_id);
    if (!category) {
      return res.status(404).json({
        message: 'Danh mục sản phẩm không tồn tại'
      });
    }

    // Create product
    const product = new Product({
      product_name,
      product_description: product_description || '',
      product_price,
      product_quantity,
      product_category_id,
      product_imageurl: product_imageurl || '',
      user_id: req.user._id,
      product_status: 'available'
    });

    await product.save();

    res.status(201).json(successResponse({
      message: 'Tạo sản phẩm thành công!',
      product
    }));

  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    console.log('Get My Products Request:', {
      user: req.user ? { id: req.user._id, account_type: req.user.account_type } : null
    });

    // Kiểm tra user authentication
    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để thực hiện thao tác này'
      });
    }

    // Cho phép cả role_name 'shop' hoặc account_type.type 3, 4
    const isShop = req.user.role_id?.role_name === 'shop' || 
                   req.user.account_type?.type === 3 || 
                   req.user.account_type?.type === 4;

    if (!isShop) {
      return res.status(403).json({
        message: 'Chỉ có Shop mới có thể xem sản phẩm của mình'
      });
    }

    const products = await Product.find({ user_id: req.user._id })
      .populate('product_category_id', 'product_category_name product_category_imageurl')
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} products for user ${req.user._id}`);

    res.status(200).json(products);

  } catch (error) {
    console.error('Get My Products Error:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách sản phẩm!',
      error: error.message
    });
  }
};

const updateMyProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để cập nhật sản phẩm'
      });
    }

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Find product and check ownership
    const product = await Product.findOne({ _id: productId, user_id: req.user._id });
    if (!product) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm hoặc bạn không có quyền chỉnh sửa'
      });
    }

    // Update product
    Object.assign(product, updateData);
    await product.save();

    res.status(200).json(successResponse({
      message: 'Cập nhật sản phẩm thành công!',
      product
    }));

  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

const deleteMyProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để xóa sản phẩm'
      });
    }

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Find product and check ownership
    const product = await Product.findOne({ _id: productId, user_id: req.user._id });
    if (!product) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm hoặc bạn không có quyền xóa'
      });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json(successResponse({
      message: 'Xóa sản phẩm thành công!'
    }));

  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};

const getMyProductStats = async (req, res) => {
  try {
    console.log('Get Product Stats Request:', {
      user: req.user ? { id: req.user._id } : null
    });

    // Kiểm tra user authentication
    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để thực hiện thao tác này'
      });
    }

    const userId = req.user._id;

    // Get product statistics
    const [totalProducts, activeProducts, draftProducts] = await Promise.all([
      Product.countDocuments({ user_id: userId }),
      Product.countDocuments({ user_id: userId, product_status: 'available' }),
      Product.countDocuments({ user_id: userId, product_status: 'not_available' })
    ]);

    // Get total product value
    const products = await Product.find({ user_id: userId, product_status: 'available' });
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.product_price * product.product_quantity);
    }, 0);

    const stats = {
      totalProducts,
      activeProducts,
      draftProducts,
      totalValue
    };

    console.log('Product stats:', stats);

    res.status(200).json(successResponse(stats));

  } catch (error) {
    console.error('Get Product Stats Error:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy thống kê sản phẩm!',
      error: error.message
    });
  }
};

// ✅ SỬA LẠI HOÀN TOÀN HÀM NÀY - Bao gồm dữ liệu Order
const getShopDashboardStats = async (req, res) => {
  try {
    console.log('🔥 Get Shop Dashboard Stats Request:', {
      user: req.user ? { id: req.user._id } : null,
      timeFilter: req.query.timeFilter
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để thực hiện thao tác này'
      });
    }

    const userId = req.user._id;
    const timeFilter = req.query.timeFilter || 'day';

    console.log('📊 Processing dashboard stats for userId:', userId, 'timeFilter:', timeFilter);

    // ===== STEP 1: Get Products =====
    const products = await Product.find({ user_id: userId })
      .populate('product_category_id', 'product_category_name');

    console.log('📦 Found products:', products.length);

    // ===== STEP 2: Get Orders for this shop =====
    const orders = await Order.find({ shop_id: userId })
      .populate('order_items.product_id', 'product_name product_price')
      .populate('customer_id', 'username email')
      .sort({ createdAt: -1 });

    console.log('📋 Found orders:', orders.length);

    // ===== STEP 3: Calculate Basic Stats =====
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.product_status === 'available').length;
    const draftProducts = products.filter(p => p.product_status === 'not_available').length;
    const totalValue = products
      .filter(p => p.product_status === 'available')
      .reduce((sum, p) => sum + (p.product_price * p.product_quantity), 0);

    // ===== STEP 4: Calculate Order Stats =====
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.order_status === 'ordered').length;
    const shippedOrders = orders.filter(o => o.order_status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.order_status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.order_status === 'cancelled').length;
    
    const totalRevenue = orders
      .filter(o => o.order_status === 'delivered')
      .reduce((sum, o) => sum + (o.order_price || 0), 0);

    console.log('📊 Basic Stats:', {
      totalProducts, activeProducts, draftProducts, totalValue,
      totalOrders, pendingOrders, totalRevenue
    });

    // ===== STEP 5: Process Chart Data - Best Selling Products By Time =====
    const productSalesByTime = {};
    
    orders.forEach(order => {
      if (order.order_items && Array.isArray(order.order_items)) {
        const orderDate = new Date(order.createdAt);
        let timeKey;
        
        // Format time key based on filter
        if (timeFilter === 'day') {
          timeKey = orderDate.toLocaleDateString('vi-VN');
        } else if (timeFilter === 'month') {
          timeKey = orderDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
        } else {
          timeKey = orderDate.getFullYear().toString();
        }
        
        order.order_items.forEach(item => {
          const productName = item.product_id?.product_name || 'Sản phẩm không xác định';
          const quantity = item.quantity || 0;
          const price = item.product_id?.product_price || 0;
          
          if (!productSalesByTime[timeKey]) {
            productSalesByTime[timeKey] = {};
          }
          if (!productSalesByTime[timeKey][productName]) {
            productSalesByTime[timeKey][productName] = { quantity: 0, revenue: 0 };
          }
          productSalesByTime[timeKey][productName].quantity += quantity;
          productSalesByTime[timeKey][productName].revenue += price * quantity;
        });
      }
    });

    // Create bestSellingProductsByTime array với format đúng cho chart
    const bestSellingProductsByTime = Object.entries(productSalesByTime)
      .map(([timeKey, products]) => {
        const topProduct = Object.entries(products)
          .sort((a, b) => b[1].quantity - a[1].quantity)[0];
        return {
          time: timeKey,
          product: topProduct ? topProduct[0] : 'Không có',
          quantity: topProduct ? topProduct[1].quantity : 0,
          revenue: topProduct ? topProduct[1].revenue : 0
        };
      })
      .sort((a, b) => {
        // Sort by date properly
        if (timeFilter === 'day') {
          return new Date(a.time.split('/').reverse().join('-')) - new Date(b.time.split('/').reverse().join('-'));
        }
        return new Date(a.time) - new Date(b.time);
      })
      .slice(-15); // Lấy 15 ngày/tháng/năm gần nhất

    console.log('📊 Best Selling Products By Time:', bestSellingProductsByTime.length, 'entries');

    // ===== STEP 6: Revenue By Time =====
    const revenueByTime = {};
    
    orders.forEach(order => {
      if (order.order_status === 'delivered') {
        const orderDate = new Date(order.createdAt);
        let dateKey;
        
        if (timeFilter === 'day') {
          dateKey = orderDate.toLocaleDateString('vi-VN');
        } else if (timeFilter === 'month') {
          dateKey = orderDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
        } else {
          dateKey = orderDate.getFullYear().toString();
        }
        
        if (!revenueByTime[dateKey]) {
          revenueByTime[dateKey] = 0;
        }
        revenueByTime[dateKey] += order.order_price || 0;
      }
    });

    const shopRevenueByTime = Object.entries(revenueByTime)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => {
        if (timeFilter === 'day') {
          return new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-'));
        }
        return new Date(a.date) - new Date(b.date);
      })
      .slice(-30); // Lấy 30 ngày/tháng/năm gần nhất

    console.log('📊 Shop Revenue By Time:', shopRevenueByTime.length, 'entries');

    // ===== STEP 7: Cumulative Revenue =====
    const cumulativeRevenue = [];
    let runningTotal = 0;
    
    shopRevenueByTime.forEach(({ date, revenue }) => {
      runningTotal += revenue;
      cumulativeRevenue.push({
        date,
        dailyRevenue: revenue,
        cumulativeRevenue: runningTotal
      });
    });

    console.log('📊 Cumulative Revenue:', cumulativeRevenue.length, 'entries');

    // ===== STEP 8: Product Revenue Share =====
    const productRevenueStats = {};
    let totalRevenueForShare = 0;

    orders.forEach(order => {
      if (order.order_status === 'delivered' && order.order_items) {
        order.order_items.forEach(item => {
          const productName = item.product_id?.product_name || 'Không xác định';
          const revenue = (item.product_id?.product_price || 0) * (item.quantity || 0);
          
          if (!productRevenueStats[productName]) {
            productRevenueStats[productName] = 0;
          }
          productRevenueStats[productName] += revenue;
          totalRevenueForShare += revenue;
        });
      }
    });

    const productRevenueShare = Object.entries(productRevenueStats)
      .map(([productName, revenue]) => ({
        productName,
        revenue,
        percentage: totalRevenueForShare > 0 ? ((revenue / totalRevenueForShare) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    console.log('📊 Product Revenue Share:', productRevenueShare.length, 'products');

    // ===== STEP 9: Prepare Final Response =====
    const dashboardStats = {
      bestSellingProductsByTime,
      productRevenueStats: productRevenueShare,
      shopRevenueByTime,
      cumulativeRevenue,
      basicStats: {
        totalProducts,
        activeProducts,
        draftProducts,
        totalValue,
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      }
    };

    console.log('✅ Dashboard stats generated successfully:', {
      basicStats: dashboardStats.basicStats,
      chartDataCounts: {
        bestSelling: dashboardStats.bestSellingProductsByTime.length,
        revenue: dashboardStats.shopRevenueByTime.length,
        products: dashboardStats.productRevenueStats.length,
        cumulative: dashboardStats.cumulativeRevenue.length
      }
    });

    res.status(200).json({
      success: true,
      data: dashboardStats
    });

  } catch (error) {
    console.error('❌ Get Shop Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard!',
      error: error.message
    });
  }
};

// API mới cho trang Analytics chi tiết
const getShopAnalytics = async (req, res) => {
  try {
    console.log('Get Shop Analytics Request:', {
      user: req.user ? { id: req.user._id } : null,
      dateRange: req.query.dateRange,
      metric: req.query.metric
    });

    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để thực hiện thao tác này'
      });
    }

    const userId = req.user._id;
    const dateRange = parseInt(req.query.dateRange) || 30;
    const metric = req.query.metric || 'revenue';

    // Tính ngày bắt đầu
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Get products
    const products = await Product.find({ user_id: userId })
      .populate('product_category_id', 'product_category_name');

    // Get orders trong khoảng thời gian
    const orders = await Order.find({ 
      shop_id: userId,
      createdAt: { $gte: startDate }
    })
      .populate('order_items.product_id', 'product_name product_price')
      .populate('customer_id', 'username email');

    // 1. Top selling products
    const productSales = {};
    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          const productId = item.product_id?._id?.toString();
          const productName = item.product_id?.product_name || 'Không xác định';
          const price = item.product_id?.product_price || 0;
          const quantity = item.quantity || 0;
          
          if (!productSales[productId]) {
            productSales[productId] = {
              productName,
              totalSold: 0,
              revenue: 0,
              price,
              lastSoldDate: order.createdAt
            };
          }
          
          productSales[productId].totalSold += quantity;
          productSales[productId].revenue += price * quantity;
          if (order.createdAt > productSales[productId].lastSoldDate) {
            productSales[productId].lastSoldDate = order.createdAt;
          }
        });
      }
    });

    const topSellingProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 20);

    // 2. Customer analysis
    const customerTypes = {};
    orders.forEach(order => {
      const customerId = order.customer_id?._id?.toString();
      if (customerId) {
        if (!customerTypes[customerId]) {
          customerTypes[customerId] = {
            orders: 0,
            totalSpent: 0,
            username: order.customer_id?.username || 'Khách hàng'
          };
        }
        customerTypes[customerId].orders += 1;
        customerTypes[customerId].totalSpent += order.order_price || 0;
      }
    });

    const customerAnalysis = [
      {
        name: 'Khách hàng mới (1 đơn)',
        count: Object.values(customerTypes).filter(c => c.orders === 1).length
      },
      {
        name: 'Khách hàng thường (2-5 đơn)',
        count: Object.values(customerTypes).filter(c => c.orders >= 2 && c.orders <= 5).length
      },
      {
        name: 'Khách hàng VIP (>5 đơn)',
        count: Object.values(customerTypes).filter(c => c.orders > 5).length
      }
    ];

    // 3. Seasonal trends
    const monthlyData = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, orders: 0 };
      }
      monthlyData[month].revenue += order.order_price || 0;
      monthlyData[month].orders += 1;
    });

    const seasonalTrends = Object.entries(monthlyData)
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        orders: data.orders
      }))
      .sort((a, b) => new Date(a.period) - new Date(b.period));

    // 4. Category performance
    const categoryStats = {};
    products.forEach(product => {
      const categoryName = product.product_category_id?.product_category_name || 'Không phân loại';
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          categoryName,
          products: 0,
          revenue: 0,
          totalSold: 0,
          totalCost: 0
        };
      }
      categoryStats[categoryName].products += 1;
    });

    // Add sales data to categories
    orders.forEach(order => {
      if (order.order_items && order.order_status === 'delivered') {
        order.order_items.forEach(item => {
          const categoryName = item.product_id?.product_category_id?.product_category_name || 'Không phân loại';
          if (categoryStats[categoryName]) {
            const revenue = (item.product_id?.product_price || 0) * (item.quantity || 0);
            categoryStats[categoryName].revenue += revenue;
            categoryStats[categoryName].totalSold += item.quantity || 0;
          }
        });
      }
    });

    const categoryPerformance = Object.values(categoryStats)
      .map(cat => ({
        ...cat,
        profitMargin: cat.revenue > 0 ? ((cat.revenue - cat.totalCost) / cat.revenue * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 5. Time analysis - orders by hour
    const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orderCount: 0
    }));

    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyOrders[hour].orderCount += 1;
    });

    const timeAnalysis = hourlyOrders.filter(h => h.orderCount > 0);

    const analyticsData = {
      topSellingProducts,
      customerAnalysis,
      seasonalTrends,
      categoryPerformance,
      timeAnalysis
    };

    console.log('Analytics data generated successfully');

    res.status(200).json(successResponse(analyticsData));

  } catch (error) {
    console.error('Get Shop Analytics Error:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy dữ liệu phân tích!',
      error: error.message
    });
  }
};

// Report product (cho customers)
const reportProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { reason, description } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: 'Bạn cần đăng nhập để báo cáo sản phẩm'
      });
    }

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: 'ID sản phẩm không hợp lệ'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Check if user already reported this product
    const existingReport = await ProductReport.findOne({
      product_id: productId,
      reporter_id: req.user._id
    });

    if (existingReport) {
      return res.status(400).json({
        message: 'Bạn đã báo cáo sản phẩm này rồi'
      });
    }

    // Create report
    const report = new ProductReport({
      product_id: productId,
      reporter_id: req.user._id,
      reason,
      description
    });

    await report.save();

    res.status(201).json({
      message: 'Báo cáo sản phẩm thành công!'
    });

  } catch (error) {
    console.error('Report Product Error:', error);
    res.status(500).json({
      message: 'Lỗi khi báo cáo sản phẩm',
      error: error.message
    });
  }
};

// Public product functions
const getAllProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ 
      product_category_id: categoryId,
      product_status: 'available'
    }).populate('product_category_id', 'product_category_name');

    res.status(200).json(products);
  } catch (error) {
    console.error('Get Products By Category Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllProductByName = async (req, res) => {
  try {
    const { name } = req.params;
    console.log("productName param type:", typeof name, "value:", name);

    const products = await Product.find({
      product_name: { $regex: name, $options: 'i' },
      product_status: 'available'
    }).populate('product_category_id', 'product_category_name');

    res.status(200).json(products);
  } catch (error) {
    console.error('Get Products By Name Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllProductRecentUploaded = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const products = await Product.find({ product_status: 'available' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('product_category_id', 'product_category_name');

    res.status(200).json(products);
  } catch (error) {
    console.error('Get Recent Products Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId)
      .populate('product_category_id', 'product_category_name')
      .populate('user_id', 'username email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Get Product Details Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const checkProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isAvailable = product.product_status === 'available' && product.product_quantity > 0;
    res.status(200).json({ isAvailable });
  } catch (error) {
    console.error('Check Product Availability Error:', error);
    res.status(500).json({ message: 'Server error' });
 }
};

// Feedback functions
const createFeedbackAndRating = async (req, res) => {
 try {
   const { productId } = req.params;
   const { rating, feedback_content } = req.body;

   if (!req.user) {
     return res.status(401).json({
       message: 'Bạn cần đăng nhập để đánh giá sản phẩm'
     });
   }

   // Validate input
   if (!rating || rating < 1 || rating > 5) {
     return res.status(400).json({
       message: 'Rating phải từ 1 đến 5 sao'
     });
   }

   // Check if product exists
   const product = await Product.findById(productId);
   if (!product) {
     return res.status(404).json({
       message: 'Không tìm thấy sản phẩm'
     });
   }

   // Check if user already reviewed this product
   const existingFeedback = await Feedback.findOne({
     product_id: productId,
     user_id: req.user._id
   });

   if (existingFeedback) {
     return res.status(400).json({
       message: 'Bạn đã đánh giá sản phẩm này rồi'
     });
   }

   // Create feedback
   const feedback = new Feedback({
     product_id: productId,
     user_id: req.user._id,
     rating,
     feedback_content: feedback_content || ''
   });

   await feedback.save();

   // Update average rating
   await updateAverageRating(productId);

   res.status(201).json({
     message: 'Đánh giá sản phẩm thành công!'
   });

 } catch (error) {
   console.error('Create Feedback Error:', error);
   res.status(500).json({
     message: 'Lỗi khi tạo đánh giá',
     error: error.message
   });
 }
};

const viewFeedbackAndRating = async (req, res) => {
 try {
   const { productId } = req.params;

   const feedbacks = await Feedback.find({ product_id: productId })
     .populate('user_id', 'username user_imageurl')
     .sort({ createdAt: -1 });

   res.status(200).json(feedbacks);

 } catch (error) {
   console.error('View Feedback Error:', error);
   res.status(500).json({
     message: 'Lỗi khi lấy đánh giá',
     error: error.message
   });
 }
};

const editFeedbackAndRating = async (req, res) => {
 try {
   const { feedbackId } = req.params;
   const { rating, feedback_content } = req.body;

   if (!req.user) {
     return res.status(401).json({
       message: 'Bạn cần đăng nhập để chỉnh sửa đánh giá'
     });
   }

   // Find feedback
   const feedback = await Feedback.findById(feedbackId);
   if (!feedback) {
     return res.status(404).json({
       message: 'Không tìm thấy đánh giá'
     });
   }

   // Check ownership
   if (feedback.user_id.toString() !== req.user._id.toString()) {
     return res.status(403).json({
       message: 'Bạn không có quyền chỉnh sửa đánh giá này'
     });
   }

   // Update feedback
   if (rating) feedback.rating = rating;
   if (feedback_content !== undefined) feedback.feedback_content = feedback_content;

   await feedback.save();

   // Update average rating
   await updateAverageRating(feedback.product_id);

   res.status(200).json({
     message: 'Cập nhật đánh giá thành công!'
   });

 } catch (error) {
   console.error('Edit Feedback Error:', error);
   res.status(500).json({
     message: 'Lỗi khi cập nhật đánh giá',
     error: error.message
   });
 }
};

const deleteFeedbackAndRating = async (req, res) => {
 try {
   const { feedbackId } = req.params;

   if (!req.user) {
     return res.status(401).json({
       message: 'Bạn cần đăng nhập để xóa đánh giá'
     });
   }

   // Find feedback
   const feedback = await Feedback.findById(feedbackId);
   if (!feedback) {
     return res.status(404).json({
       message: 'Không tìm thấy đánh giá'
     });
   }

   // Check ownership
   if (feedback.user_id.toString() !== req.user._id.toString()) {
     return res.status(403).json({
       message: 'Bạn không có quyền xóa đánh giá này'
     });
   }

   const productId = feedback.product_id;
   await Feedback.findByIdAndDelete(feedbackId);

   // Update average rating
   await updateAverageRating(productId);

   res.status(200).json({
     message: 'Xóa đánh giá thành công!'
   });

 } catch (error) {
   console.error('Delete Feedback Error:', error);
   res.status(500).json({
     message: 'Lỗi khi xóa đánh giá',
     error: error.message
   });
 }
};

// Admin functions
const approveProduct = async (req, res) => {
 try {
   const { productId } = req.query;
   
   if (!productId) {
     return res.status(400).json({ message: 'Product ID is required' });
   }

   const product = await Product.findById(productId);
   if (!product) {
     return res.status(200).json({ message: 'Product not found', data: [] });
   }
   
   product.product_status = 'available';
   await product.save();

   res.status(200).json(successResponse({
     message: 'Product approved successfully',
     product
   }));
 } catch (error) {
   console.error('Approve Product Error:', error);
   res.status(500).json({ message: 'Server error' });
 }
};

const getTopRatedProducts = async (req, res) => {
 try {
   const limit = parseInt(req.query.limit) || 12;

   const products = await Product.find({ 
     product_status: 'available', 
     average_rating: { $gt: 0 } 
   })
   .sort({ average_rating: -1 })
   .limit(limit)
   .populate('product_category_id', 'product_category_name');

   if (!products || products.length === 0) {
     return res.status(200).json({ 
       message: 'No products found with ratings',
       data: []
     });
   }

   res.status(200).json({
     message: 'Top rated products fetched successfully',
     count: products.length,
     data: products
   });
 } catch (error) {
   console.error(error);
   res.status(500).json({
     message: 'Error fetching top rated products',
     error: error.message
   });
 }
};

module.exports = {
 // Shop functions
 createProduct,
 getMyProducts,
 updateMyProduct,
 deleteMyProduct,
 getMyProductStats,
 getShopDashboardStats, // ✅ Export function đã sửa
 getShopAnalytics,
 reportProduct,

 // Public functions
 getAllProductsByCategory,
 getAllProductByName, 
 getAllProductRecentUploaded, 
 getProductDetails,
 checkProductAvailability,
 
 // Feedback functions
 createFeedbackAndRating, 
 viewFeedbackAndRating, 
 editFeedbackAndRating,
 deleteFeedbackAndRating,
 
 // Admin functions
 approveProduct,
 getTopRatedProducts
};