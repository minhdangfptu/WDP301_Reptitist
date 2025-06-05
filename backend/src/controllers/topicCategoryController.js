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
exports.getTopicById = async (req, res) => {
  try {
    const topic = await TopicCategory.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: "Topic không tồn tại" });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};