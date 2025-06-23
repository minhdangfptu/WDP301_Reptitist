const express = require('express');
const router = express.Router();

const topicCategoryController = require('../controllers/topicCategoryController');

// GET all topics
router.get('/library_topics', topicCategoryController.getAllTopics);

// GET one topic by ID
router.get('/library_topics/:id', topicCategoryController.getTopicById);

// POST create a new topic
router.post('/library_topics', topicCategoryController.createTopic);

// PUT update a topic by ID
router.put('/library_topics/:id', topicCategoryController.updateTopic);

// DELETE a topic by ID
router.delete('/library_topics/:id', topicCategoryController.deleteTopic);

// Export the router
module.exports = router;