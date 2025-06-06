const TopicCategory = require('../models/Library_topics');

// Lấy danh sách tất cả topic categories
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await TopicCategory.find().populate('category_id');
    if (!topics) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề nào' });
    }
    res.json(topics);
  } catch (error) {
    console.error('Error fetching library topics:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy danh sách chủ đề',
      error: error.message 
    });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topic = await TopicCategory.findById(req.params.id).populate('category_id');
    if (!topic) {
      return res.status(404).json({ message: "Chủ đề không tồn tại" });
    }
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic by ID:', error);
    res.status(500).json({ 
      message: "Lỗi server khi lấy thông tin chủ đề", 
      error: error.message 
    });
  }
};
