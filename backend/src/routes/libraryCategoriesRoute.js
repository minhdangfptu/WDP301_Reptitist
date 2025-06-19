const express = require('express');
const router = express.Router();
const { createCategory, getCategoryById, updateCategory, deleteCategory, getAllCategories, getCategoriesByTopicId } = require('../controllers/libraryCategoriesController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/topic/:topicId', authMiddleware, roleMiddleware('admin'), createCategory); // Create
router.get('/:id', authMiddleware, getCategoryById); // View
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateCategory); // Update
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCategory); // Delete
router.get('/', authMiddleware, getAllCategories);
router.get('/topic/:topicId', authMiddleware, getCategoriesByTopicId);

module.exports = router;