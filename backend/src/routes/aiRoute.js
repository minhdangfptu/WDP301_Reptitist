const express = require('express');
const {createAiHistory, updateConversation, getBehaviourRecommendation} = require('../controllers/aiController');
const router = express.Router();

// router.get('/reptile/ai/history/:historyId',)
router.post('/new-conversation',createAiHistory)
router.put('/update-conversation/:historyId', updateConversation);
router.get('/get-behaviour/:reptileId', getBehaviourRecommendation);

module.exports = router;