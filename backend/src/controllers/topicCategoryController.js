const TopicCategory = require('../models/Library_topics');

// Lấy danh sách tất cả topic
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await TopicCategory.find().populate('category_id');
    if (!topics) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề nào' });
    }
    res.status(200).json(topics);
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

// Lấy chủ đề theo ID
exports.getTopicById = async (req, res) => {
  try {
    const topic = await TopicCategory.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Chủ đề không tồn tại" });
    }
    res.status(200).json(topic);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Tạo mới chủ đề
exports.createTopic = async (req, res) => {
  try {
    const newTopic = new TopicCategory(req.body);
    const savedTopic = await newTopic.save();
    res.status(201).json(savedTopic);
  } catch (error) {
    console.error('Lỗi khi tạo chủ đề:', error);
    res.status(400).json({ message: 'Lỗi khi tạo chủ đề', error: error.message });
  }
};

// Cập nhật chủ đề
exports.updateTopic = async (req, res) => {
  try {
    const updatedTopic = await TopicCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTopic) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề để cập nhật' });
    }
    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật chủ đề', error: error.message });
  }
};

// Xoá chủ đề
exports.deleteTopic = async (req, res) => {
  try {
    const deletedTopic = await TopicCategory.findByIdAndDelete(req.params.id);
    if (!deletedTopic) {
      return res.status(404).json({ message: 'Không tìm thấy chủ đề để xoá' });
    }
    res.status(200).json({ message: 'Đã xoá chủ đề thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá chủ đề', error: error.message });
  }
};
