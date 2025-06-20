const mongoose = require('mongoose');
const LibraryCategory = require('../models/library_category'); // Đảm bảo đúng tên model
const LibraryTopic = require('../models/library_topics');

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
  try {
    const { category_content, category_description, category_imageurl, topic_id } = req.body;

    // Kiểm tra chủ đề tồn tại
    const topic = await LibraryTopic.findById(topic_id);
    if (!topic) {
      return res.status(404).json({ error: "Không tìm thấy chủ đề" });
    }

    const newCategory = new LibraryCategory({
      category_content,
      category_description,
      category_imageurl,
      topic_id,
    });

    await newCategory.save();
    res.status(201).json({ message: 'Tạo danh mục thành công', category: newCategory });
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
    res.status(400).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await LibraryCategory.find().populate('topic_id', 'topic_name');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: error.message });
  }
};

// Lấy danh mục theo ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const category = await LibraryCategory.findById(id).populate('topic_id', 'topic_name');
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục theo ID:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: error.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_content, category_description, category_imageurl, topic_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const updatedCategory = await LibraryCategory.findByIdAndUpdate(
      id,
      { category_content, category_description, category_imageurl, topic_id },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.status(200).json({ message: 'Cập nhật danh mục thành công', category: updatedCategory });
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    res.status(400).json({ message: 'Lỗi khi cập nhật danh mục', error: error.message });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const deletedCategory = await LibraryCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }

    res.status(200).json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).json({ message: 'Lỗi khi xóa danh mục', error: error.message });
  }
};

// Lấy danh mục theo topic_id
exports.getCategoriesByTopicId = async (req, res) => {
  try {
    const { topicId } = req.params;

    const categories = await LibraryCategory.find({ topic_id: topicId });
    // if (!categories || categories.length === 0) {
    //   return res.status(404).json({ message: 'Không tìm thấy danh mục cho chủ đề này' });
    // }

    res.status(200).json(categories);
  } catch (error) {
    console.error('Lỗi khi lấy danh mục theo chủ đề:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh mục theo chủ đề', error: error.message });
  }
};
