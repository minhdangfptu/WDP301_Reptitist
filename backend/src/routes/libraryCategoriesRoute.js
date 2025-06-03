// const express = require('express');
// const router = express.Router();
// const { createCategory, getCategoryById, updateCategory, deleteCategory } = require('../controllers/libraryCategoriesController');

// // Middleware kiểm tra quyền (giả lập Admin/User)
// const checkRole = (requiredRole) => (req, res, next) => {
//   const userRole = req.headers['role'] || 'user'; // Giả lập role từ header
//   if (userRole !== requiredRole) {
//     return res.status(403).json({ message: 'Quyền bị từ chối' });
//   }
//   next();
// };

// router.post('/', checkRole('admin'), createCategory); // Create (Admin)
// router.get('/:id', checkRole('user'), getCategoryById); // View (User)
// router.put('/:id', checkRole('admin'), updateCategory); // Update (Admin)
// router.delete('/:id', checkRole('admin'), deleteCategory); // Delete (Admin)

// module.exports = router;


const express = require('express');
const router = express.Router();
const { createCategory, getCategoryById, updateCategory, deleteCategory, getAllCategories } = require('../controllers/libraryCategoriesController');

// Bỏ middleware checkRole để không kiểm tra quyền
router.post('/', createCategory); // Create
router.get('/:id', getCategoryById); // View
router.put('/:id', updateCategory); // Update
router.delete('/:id', deleteCategory); // Delete
router.get('/', getAllCategories);
module.exports = router;