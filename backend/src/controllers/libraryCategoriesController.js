const LibraryCategories = require('../models/Library_category');

exports.createCategory = async (req, res) => {
  try {
    const { category_content, category_description, category_imageurl } = req.body;
    const newCategory = new LibraryCategories({
      category_content,
      category_description,
      category_imageurl,
    });
    await newCategory.save();
    res.status(201).json({ message: 'Tạo danh mục thành công', category: newCategory });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await LibraryCategories.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_content, category_description, category_imageurl } = req.body;
    const updatedCategory = await LibraryCategories.findByIdAndUpdate(
      id,
      { category_content, category_description, category_imageurl },
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    res.status(200).json({ message: 'Cập nhật danh mục thành công', category: updatedCategory });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật danh mục', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await LibraryCategories.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Danh mục không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa danh mục', error: error.message });
  }
};