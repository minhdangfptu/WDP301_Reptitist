const express= require('express');
const router =express.Router();
const { createUserReptile, getReptileById, createTreatmentHistory, createWeight_Sleep_NutritionHistory } = require("../controllers/userReptileController");

router.post('/', createUserReptile); // Create
router.get('/:reptileId', getReptileById); // View
router.post('/create-treatment/:reptileId', createTreatmentHistory); // Create treatment history4
router.put('/updateNormalInfo/:reptileId', createWeight_Sleep_NutritionHistory); // Update normal info
// // router.put('/:id', updateCategory); // Update
// // router.delete('/:id', deleteCategory); // Delete
// router.get('/', getAllCategories);


module.exports = router;