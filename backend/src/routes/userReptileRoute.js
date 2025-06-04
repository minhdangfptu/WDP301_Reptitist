const express= require('express');
const router =express.Router();
const { createUserReptile, getReptileById } = require("../controllers/userReptileController");

router.post('/', createUserReptile); // Create
router.get('/:reptileId', getReptileById); // View
// // router.put('/:id', updateCategory); // Update
// // router.delete('/:id', deleteCategory); // Delete
// router.get('/', getAllCategories);


module.exports = router;