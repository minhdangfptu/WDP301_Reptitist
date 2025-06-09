const express= require('express');
const router =express.Router();
const { createUserReptile, getReptileById, updateTreatmentHistory,getAllUserReptilesByUser, deleteUserReptile, createHealthHistory } = require("../controllers/userReptileController");

router.post('/', createUserReptile); // Create
router.get('/:reptileId', getReptileById); // View
router.get('/get-reptile/:userId', getAllUserReptilesByUser); // View
router.put('/create-treatment/:reptileId', updateTreatmentHistory); // Create treatment history4
router.put('/health-history/:reptileId', createHealthHistory); // Update normal info
router.delete('/:reptileId',deleteUserReptile);


module.exports = router;