const Product = require('../models/Products');
const Feedback = require('../models/Product_feedback');
const ProductReport = require('../models/Product_reports');
const mongoose = require('mongoose');
const { successResponse } = require('../../utils/APIResponse');

async function updateAverageRating(productId) {
  try {
    // Ensure productId is a valid ObjectId (using new)
    const result = await Feedback.aggregate([
      { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$product_id', avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = result.length > 0 ? result[0].avgRating : 0;

    // Update the average rating for the product
    await Product.findByIdAndUpdate(productId, { average_rating: avgRating });
    console.log(`Updated average rating for product: ${productId}`);

  } catch (error) {
    console.error('Error updating average rating:', error);
  }
}

// Tạo sản phẩm mới (chỉ dành cho Shop)
const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_price,
      product_description,
      product_imageurl,
      product_category_id,
      product_quantity
    } = req.body;

    // Kiểm tra user có phải là shop không
    if (!req.user || req.user.role_id?.role_name !== 'shop') {
      return res.status(403).json({
        message: 'Chỉ có Shop mới có thể tạo sản phẩm'
      });
    }

    if (!product_name || !product_price || !product_category_id) {
      return res.status(400).json({
        message: 'Thiếu thông tin bắt buộc: tên sản phẩm, giá bán hoặc danh mục'
      });
    }

    const product = new Product({
      product_name,
      product_price,
      user_id: req.user._id, // Tự động lấy từ token
      product_description,
      product_imageurl: product_imageurl || '',
      product_category_id,
      product_quantity: product_quantity || 0,
      product_status: 'available' // Sản phẩm hiện lên ngay, không cần duyệt
    });

    await product.save();

    res.status(201).json({ 
      message: 'Tạo sản phẩm thành công!', 
      product 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi tạo sản phẩm!',
      error: error.message
    });
  }
};

// Lấy tất cả sản phẩm của Shop hiện tại
const getMyProducts = async (req, res) => {
  try {
    // Kiểm tra user có phải là shop không
    if (!req.user || req.user.role_id?.role_name !== 'shop') {
      return res.status(403).json({
        message: 'Chỉ có Shop mới có thể xem sản phẩm của mình'
      });
    }

    const { page = 1, limit = 10, status, category } = req.query;
    
    const query = { user_id: req.user._id };
    
    if (status && status !== 'all') {
      query.product_status = status;
    }
    
    if (category && category !== 'all') {
      query.product_category_id = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .populate('product_category_id', 'product_category_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách sản phẩm!',
      error: error.message
    });
  }
};

// Cập nhật sản phẩm (chỉ Shop owner)
const updateMyProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedData = req.body;

    // Kiểm tra sản phẩm có thuộc về shop này không
    const product = await Product.findOne({ 
      _id: productId, 
      user_id: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Không tìm thấy sản phẩm hoặc bạn không có quyền chỉnh sửa' 
      });
    }

    // Nếu sản phẩm đang bị báo cáo, không cho phép chỉnh sửa
    if (product.product_status === 'reported') {
      return res.status(403).json({
        message: 'Sản phẩm đang bị báo cáo, không thể chỉnh sửa'
      });
    }

    // Không cho phép thay đổi trạng thái từ reported
    if (product.product_status === 'reported' && updatedData.product_status) {
      delete updatedData.product_status;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      updatedData, 
      { new: true, runValidators: true }
    ).populate('product_category_id', 'product_category_name');

    res.status(200).json({ 
      message: 'Cập nhật sản phẩm thành công!', 
      product: updatedProduct 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi cập nhật sản phẩm!',
      error: error.message
    });
  }
};

// Xóa sản phẩm (chỉ Shop owner)
const deleteMyProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm có thuộc về shop này không
    const product = await Product.findOne({ 
      _id: productId, 
      user_id: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Không tìm thấy sản phẩm hoặc bạn không có quyền xóa' 
      });
    }

    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({ 
      message: 'Xóa sản phẩm thành công!', 
      deletedProductId: productId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi xóa sản phẩm!',
      error: error.message
    });
  }
};

// Báo cáo sản phẩm (dành cho Customer)
const reportProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { reason, description } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra user đã báo cáo sản phẩm này chưa
    const existingReport = await ProductReport.findOne({
      product_id: productId,
      reporter_id: req.user._id
    });

    if (existingReport) {
      return res.status(400).json({ 
        message: 'Bạn đã báo cáo sản phẩm này rồi' 
      });
    }

    // Tạo báo cáo mới
    const report = new ProductReport({
      product_id: productId,
      reporter_id: req.user._id,
      shop_id: product.user_id,
      reason,
      description,
      status: 'pending'
    });

    await report.save();

    // Chuyển trạng thái sản phẩm sang 'reported' 
    await Product.findByIdAndUpdate(productId, { 
      product_status: 'reported' 
    });

    res.status(201).json({
      message: 'Báo cáo sản phẩm thành công',
      report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi báo cáo sản phẩm',
      error: error.message
    });
  }
};

// Lấy thống kê sản phẩm của Shop
const getMyProductStats = async (req, res) => {
  try {
    // Kiểm tra user có phải là shop không
    if (!req.user || req.user.role_id?.role_name !== 'shop') {
      return res.status(403).json({
        message: 'Chỉ có Shop mới có thể xem thống kê'
      });
    }

    const shopId = req.user._id;

    const totalProducts = await Product.countDocuments({ user_id: shopId });
    const availableProducts = await Product.countDocuments({ 
      user_id: shopId, 
      product_status: 'available' 
    });
    const reportedProducts = await Product.countDocuments({ 
      user_id: shopId, 
      product_status: 'reported' 
    });
    const notAvailableProducts = await Product.countDocuments({ 
      user_id: shopId, 
      product_status: 'not_available' 
    });
    const outOfStock = await Product.countDocuments({ 
      user_id: shopId, 
      product_quantity: 0 
    });

    // Tính tổng giá trị kho hàng
    const inventoryValue = await Product.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(shopId) } },
      { $group: { 
          _id: null, 
          totalValue: { 
            $sum: { $multiply: ['$product_price', '$product_quantity'] } 
          } 
        } 
      }
    ]);

    const stats = {
      totalProducts,
      availableProducts,
      reportedProducts,
      notAvailableProducts,
      outOfStock,
      inventoryValue: inventoryValue[0]?.totalValue || 0
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

// Các function cũ vẫn giữ cho public access
const getAllProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.find({ 
      product_category_id: categoryId,
      product_status: 'available' // Chỉ hiển thị sản phẩm available
    }).populate('user_id', 'username'); // Populate thông tin shop

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Không có sản phẩm nào trong danh mục này' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy sản phẩm!',
      error: error.message
    });
  }
};

const getAllProductByName = async (req, res) => {
  try {
    const { productName } = req.params;
    const products = await Product.find({ 
      product_name: { $regex: productName, $options: 'i' },
      product_status: 'available' 
    }).populate('user_id', 'username address');
    
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm với tên này' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi tìm sản phẩm!',
      error: error.message
    });
  }
};

const getAllProductRecentUploaded = async (req, res) => {
  try {
    const products = await Product.find({ 
      product_status: 'available' 
    })
    .populate('user_id', 'username')
    .sort({ createdAt: -1 })
    .limit(10);
    
    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Không có sản phẩm mới nào' });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy sản phẩm mới!',
      error: error.message
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId)
      .populate('user_id', 'username')
      .populate('product_category_id', 'product_category_name');
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Lỗi khi lấy chi tiết sản phẩm!',
      error: error.message
    });
  }
};

// Feedback functions giữ nguyên
const createFeedbackAndRating = async (req, res) => {
  try {

    const { productId } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const existingFeedback = await Feedback.findOne({ product_id: productId, user_id });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const newFeedback = new Feedback({
      product_id: productId,
      user_id,
      rating,
      comment
    });

    await newFeedback.save();
    await updateAverageRating(productId);

    return res.status(201).json({
      message: 'Đánh giá thành công',
      feedback: newFeedback
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Lỗi khi tạo đánh giá',
      error: error.message
    });
  }
};

const viewFeedbackAndRating = async (req, res) => {
  try {
    const { productId } = req.params;

    const feedbacks = await Feedback.find({ product_id: productId })
      .populate({
        path: 'user_id',
        select: 'username fullname user_imageurl'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: 'Lấy đánh giá thành công',
      count: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Lỗi khi lấy đánh giá',
      error: error.message
    });
  }
};

const editFeedbackAndRating = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, comment } = req.body;
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    if (feedback.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa đánh giá này' });
    }

    feedback.rating = rating;
    feedback.comment = comment;
    await feedback.save();
    
    await updateAverageRating(feedback.product_id);
    
    return res.status(200).json({
      message: 'Cập nhật đánh giá thành công',
      feedback
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Lỗi khi cập nhật đánh giá',
      error: error.message
    });
  }
};

const deleteFeedbackAndRating = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    if (feedback.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
    }
    
    await Feedback.findByIdAndDelete(feedbackId);
    await updateAverageRating(feedback.product_id);
    
    return res.status(200).json({
      message: 'Xóa đánh giá thành công'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Lỗi khi xóa đánh giá',
      error: error.message
    });
  }
};
const approveProduct = async (req, res) => {
  try {
    const { id } = req.query; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(200).json({ message: 'Product not found', data:[] });
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
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",products);
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
  reportProduct,
  approveProduct,

  // Public functions
  getAllProductsByCategory,
  getAllProductByName, 
  getAllProductRecentUploaded, 
  getProductDetails, 
  
  // Feedback functions
  createFeedbackAndRating, 
  viewFeedbackAndRating, 
  editFeedbackAndRating,
  deleteFeedbackAndRating,
  getTopRatedProducts
};

