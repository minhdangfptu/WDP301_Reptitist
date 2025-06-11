const express = require('express');
const router = express.Router();

const topicCategoryController = require('../controllers/topicCategoryController');

// GET /library_topics
router.get('/library_topics', topicCategoryController.getAllTopics);
router.get('/library_topics/:id', topicCategoryController.getTopicById);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
module.exports = router;
=======
router.post('/library_topics', topicCategoryController.createTopic);
router.put('/library_topics/:id', topicCategoryController.updateTopic);
router.delete('/library_topics/:id', topicCategoryController.deleteTopic);
module.exports = router;
>>>>>>> Stashed changes
