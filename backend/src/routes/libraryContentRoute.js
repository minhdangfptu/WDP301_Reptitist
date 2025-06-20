const express = require('express');
const router = express.Router();
const {
  createLibraryContent,
  getAllLibraryContents,
  getLibraryContentById,
  updateLibraryContent,
  deleteLibraryContent
} = require('../controllers/libraryContentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware('admin'), createLibraryContent); // Create
router.get('/', authMiddleware, getAllLibraryContents); // View list
router.get('/:id', authMiddleware, getLibraryContentById); // Detail
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateLibraryContent); // Update
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteLibraryContent); // Delete

module.exports = router;