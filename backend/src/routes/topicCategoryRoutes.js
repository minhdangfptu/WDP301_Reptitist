const express = require('express');
const router = express.Router();

const topicCategoryController = require('../controllers/topicCategoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET all topics
router.get('/library_topics', authMiddleware, topicCategoryController.getAllTopics);

// GET one topic by ID
router.get('/library_topics/:id', authMiddleware, topicCategoryController.getTopicById);

// POST create a new topic
router.post('/library_topics', authMiddleware, roleMiddleware('admin'), topicCategoryController.createTopic);

// PUT update a topic by ID
router.put('/library_topics/:id', authMiddleware, roleMiddleware('admin'), topicCategoryController.updateTopic);

// DELETE a topic by ID
router.delete('/library_topics/:id', authMiddleware, roleMiddleware('admin'), topicCategoryController.deleteTopic);

// Export the router
module.exports = router;
