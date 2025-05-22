const express = require('express');
const {createCategory, getAllCategories, getCategoriesById, editCategory, deleteCategory} = require('../controllers/productCategoryController');
const router = express.Router();
router.post('/create-category', createCategory);
router.get('/category', getAllCategories);
router.get('/category/:categoryId', getCategoriesById);
router.put('/edit-category/:categoryId', editCategory);
router.delete('/category/:categoryId', deleteCategory); 
module.exports = router;