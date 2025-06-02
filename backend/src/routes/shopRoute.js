const express = require('express');
const {createCategory, getAllCategories, getCategoriesById, editCategory, deleteCategory} = require('../controllers/productCategoryController');
const {getAllProductsByCategory, getAllProductByName, getAllProductRecentUploaded, getProductDetails, deleteProduct, updateProduct, updateProductStatus, createProduct, createFeedbackAndRating, viewFeedbackAndRating} = require('../controllers/productController');
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

router.post('/products-feedbacks/:productId', createFeedbackAndRating);
router.get('/products-feedbacks/:productId', viewFeedbackAndRating);



module.exports = router;