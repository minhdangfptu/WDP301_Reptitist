// const express = require('express');
// const router = express.Router();
// const {
//   createLibraryContent,
//   getAllLibraryContents,
//   getLibraryContentById,
//   updateLibraryContent,
//   deleteLibraryContent
// } = require('../controllers/libraryContentController');

// // Middleware giả lập role
// const checkRole = (requiredRole) => (req, res, next) => {
//   const userRole = req.headers['role'] || 'user';
//   if (userRole !== requiredRole) {
//     return res.status(403).json({ message: 'Quyền bị từ chối' });
//   }
//   next();
// };

// router.post('/', checkRole('admin'), createLibraryContent); // Create
// router.get('/', checkRole('user'), getAllLibraryContents); // View list
// router.get('/:id', checkRole('user'), getLibraryContentById); // Detail
// router.put('/:id', checkRole('admin'), updateLibraryContent); // Update
// router.delete('/:id', checkRole('admin'), deleteLibraryContent); // Delete

// module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createLibraryContent,
  getAllLibraryContents,
  getLibraryContentById,
  updateLibraryContent,
  deleteLibraryContent
} = require('../controllers/libraryContentController');


router.post('/', createLibraryContent); // Create
router.get('/', getAllLibraryContents); // View list
router.get('/:id', getLibraryContentById); // Detail
router.put('/:id', updateLibraryContent); // Update
router.delete('/:id', deleteLibraryContent); // Delete

module.exports = router;
