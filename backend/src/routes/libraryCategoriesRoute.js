const express = require('express');
const router = express.Router();
const { createCategory, getCategoryById, updateCategory, deleteCategory, getAllCategories, getCategoriesByTopicId } = require('../controllers/libraryCategoriesController');

router.post('/topic/:topicId', createCategory); // Create
router.get('/:id', getCategoryById); // View
router.put('/:id', updateCategory); // Update
router.delete('/:id', deleteCategory); // Delete
router.get('/', getAllCategories);
router.get('/topic/:topicId', getCategoriesByTopicId);

module.exports = router;