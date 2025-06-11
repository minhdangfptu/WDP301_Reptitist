const express = require('express');
const {authMiddleware, authUserIdOnly} = require('../middleware/authMiddleware');
const {createCategory, getAllCategories, getCategoriesById, editCategory, deleteCategory} = require('../controllers/productCategoryController');
const {getAllProductsByCategory, getAllProductByName, getAllProductRecentUploaded, getProductDetails, deleteProduct, updateProduct, updateProductStatus, createProduct, createFeedbackAndRating, viewFeedbackAndRating, deleteFeedbackAndRating, editFeedbackAndRating, getTopRatedProducts} = require('../controllers/productController');
const {addProductToCart, getCart, deleteProductFromCart, deleteAllProductFromCart} = require('../controllers/cartController');
const router = express.Router();
router.post('/create-category', createCategory);
router.get('/category', getAllCategories);
router.get('/category/:categoryId', getCategoriesById);
router.put('/edit-category/:categoryId', editCategory);
router.delete('/category/:categoryId', deleteCategory); 

router.get('/products/category/:categoryId',getAllProductsByCategory)
router.get('/products/search/:productName',getAllProductByName)
router.get('/products/recent/',getAllProductRecentUploaded)
router.get('/products/detail/:productId',getProductDetails)
router.delete('/products/:productId',deleteProduct)
router.put('/products/:productId',updateProduct)
router.put('/product-status/:productId',updateProductStatus)
router.post('/products/create', createProduct);
router.get('/products/top-rated', getTopRatedProducts);

router.post('/products-feedbacks/:productId',authUserIdOnly, createFeedbackAndRating);
router.get('/products-feedbacks/:productId', viewFeedbackAndRating);
router.put('/products-feedbacks/:feedbackId',authUserIdOnly, editFeedbackAndRating);
router.delete('/products-feedbacks/:feedbackId',authUserIdOnly, deleteFeedbackAndRating);

// Cart routes
router.post('/cart/add-product', authUserIdOnly, addProductToCart);
router.get('/my-cart', authUserIdOnly, getCart);
router.delete('/cart/:cartItemId', authUserIdOnly, deleteProductFromCart);
router.delete('/my-cart', authUserIdOnly, deleteAllProductFromCart);


module.exports = router;