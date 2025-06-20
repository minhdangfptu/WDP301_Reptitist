const express = require('express');
const {createAiHistory, updateConversation, getBehaviourRecommendation, getHabitatRecommendation, getNutritionRecommendation, getTreatmentRecommendation, getSummarizeRecommendation, getAllHistoryChat, createAIRecommendation, getAllRecommendationsAndSave, getAllRecommendations, getAIChatHistoryById} = require('../controllers/aiController');
const router = express.Router();

// router.get('/reptile/ai/history/:historyId',)
router.post('/new-conversation',createAiHistory)
router.put('/update-conversation/:historyId', updateConversation);
router.get('/get-behaviour/:reptileId', getBehaviourRecommendation);
router.get('/get-habitat/:reptileId', getHabitatRecommendation);
router.get('/get-nutrition/:reptileId', getNutritionRecommendation);
router.get('/get-treatment/:reptileId', getTreatmentRecommendation);
router.get('/get-summarize/:reptileId', getSummarizeRecommendation);
router.get('/get-ai-history/:reptileId', getAllHistoryChat);
router.get('/get-history/:historyId', getAIChatHistoryById);
router.post('/create-recommendation/:reptileId', createAIRecommendation);
router.post('/get-all-recommendations/:reptileId', getAllRecommendationsAndSave);
router.get('/get-all-recommendations/:reptileId', getAllRecommendations);
module.exports = router;