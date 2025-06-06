const express = require('express');
const router = express.Router();

const topicCategoryController = require('../controllers/topicCategoryController');

// GET /library_topics
router.get('/library_topics', topicCategoryController.getAllTopics);
router.get('/library_topics/:id', topicCategoryController.getTopicById);
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
module.exports = router;
