const express = require('express');
const router = express.Router();

const reptileController = require('../controllers/reptileController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.post(
  '/create-reptile',
  authMiddleware,
  roleMiddleware('admin', 'moderator', 'user'),
  reptileController.createReptile
);
router.get(
  '/get-all-reptile',
  reptileController.getAllReptiles
);
router.put(
  '/update-reptile',
  authMiddleware,
  roleMiddleware('admin', 'moderator', 'user'),
  reptileController.updateReptileById
);

router.delete(
  '/delete-reptile',
  authMiddleware,
  roleMiddleware('admin', 'moderator', 'user'),
  reptileController.deleteReptileById
);
router.get('/my-reptiles', authMiddleware, reptileController.getReptilesByUser);


module.exports = router;
