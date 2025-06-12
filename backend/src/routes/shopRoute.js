const express = require('express');
const {authMiddleware, authUserIdOnly} = require('../middleware/authMiddleware');
const {createCategory, getAllCategories, getCategoriesById, editCategory, deleteCategory} = require('../controllers/productCategoryController');
const {
  // Public product routes
  getAllProductsByCategory, 
  getAllProductByName, 
  getAllProductRecentUploaded, 
  getProductDetails,
  // Shop-specific product routes
  createProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
  getMyProductStats,
  reportProduct,
  // Feedback routes
  createFeedbackAndRating, 
  viewFeedbackAndRating, 
  deleteFeedbackAndRating, 
  editFeedbackAndRating
} = require('../controllers/productController');
const {addProductToCart, getCart, deleteProductFromCart, deleteAllProductFromCart} = require('../controllers/cartController');

const router = express.Router();

// Product Category Management (for admin)
router.post('/create-category', createCategory);
router.get('/category', getAllCategories);
router.get('/category/:categoryId', getCategoriesById);
router.put('/edit-category/:categoryId', editCategory);
router.delete('/category/:categoryId', deleteCategory); 

// Public Product Routes (for browsing)
router.get('/products/category/:categoryId', getAllProductsByCategory);
router.get('/products/search/:productName', getAllProductByName);
router.get('/products/recent/', getAllProductRecentUploaded);
router.get('/products/detail/:productId', getProductDetails);

// Shop Product Management Routes (protected)
router.post('/products/create', authMiddleware, createProduct);
router.get('/my-products', authMiddleware, getMyProducts);
router.get('/my-products/:productId', authMiddleware, getProductDetails);
router.put('/my-products/:productId', authMiddleware, updateMyProduct);
router.delete('/my-products/:productId', authMiddleware, deleteMyProduct);
router.get('/my-stats', authMiddleware, getMyProductStats);

// Product Report (for customers)
router.post('/products/:productId/report', authMiddleware, reportProduct);

// Product Feedback Routes
router.post('/products-feedbacks/:productId', authMiddleware, createFeedbackAndRating);
router.get('/products-feedbacks/:productId', viewFeedbackAndRating);
router.put('/products-feedbacks/:feedbackId', authUserIdOnly, editFeedbackAndRating);
router.delete('/products-feedbacks/:feedbackId', authUserIdOnly, deleteFeedbackAndRating);

// Shopping Cart Routes
router.post('/cart/add-product', authUserIdOnly, addProductToCart);
router.get('/my-cart', authUserIdOnly, getCart);
router.delete('/cart/:cartItemId', authUserIdOnly, deleteProductFromCart);
router.delete('/my-cart', authUserIdOnly, deleteAllProductFromCart);

module.exports = router;