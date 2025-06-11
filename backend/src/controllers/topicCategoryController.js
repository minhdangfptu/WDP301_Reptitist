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
<<<<<<< Updated upstream
=======
};


// Tạo mới
exports.createTopic = async (req, res) => {
  try {
    const newTopic = new TopicCategory(req.body);
    const savedTopic = await newTopic.save();
    res.status(201).json(savedTopic);
  } catch (error) {
    console.error('Lỗi khi tạo chủ đề:', error); // log chi tiết
    res.status(400).json({ message: 'Lỗi khi tạo chủ đề', error: error.message });
  }
};



// Cập nhật
exports.updateTopic = async (req, res) => {
  try {
    const updatedTopic = await TopicCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTopic) return res.status(404).json({ message: 'Không tìm thấy chủ đề để cập nhật' });
    res.status(200).json(updatedTopic);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật chủ đề', error });
  }
};

// Xoá
exports.deleteTopic = async (req, res) => {
  try {
    const deletedTopic = await TopicCategory.findByIdAndDelete(req.params.id);
    if (!deletedTopic) return res.status(404).json({ message: 'Không tìm thấy chủ đề để xoá' });
    res.status(200).json({ message: 'Đã xoá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xoá chủ đề', error });
  }
>>>>>>> Stashed changes
};