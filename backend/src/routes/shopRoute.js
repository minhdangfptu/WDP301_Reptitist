const express = require('express');
const {createCategory, getAllCategories, getCategoriesById, editCategory, deleteCategory} = require('../controllers/productCategoryController');
const {getAllProductsByCategory} = require('../controllers/productController');
const router = express.Router();
router.post('/create-category', createCategory);
router.get('/category', getAllCategories);
router.get('/category/:categoryId', getCategoriesById);
router.put('/edit-category/:categoryId', editCategory);
router.delete('/category/:categoryId', deleteCategory); 

router.get('/products/:categoryId',getAllProductsByCategory)
module.exports = router;