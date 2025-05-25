const TopicCategory = require('../models/library_topics');

// Lấy danh sách tất cả topic categories
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await TopicCategory.find();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching library topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
