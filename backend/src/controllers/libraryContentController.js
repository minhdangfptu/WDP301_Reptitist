const LibraryContent = require('../models/library_contents');

// [POST] Create
exports.createLibraryContent = async (req, res) => {
  try {
    const { title, content, image_urls, user_id, topic_category_id, category_content_id } = req.body;

    const newContent = new LibraryContent({
      title,
      content,
      image_urls,
      user_id,
      topic_category_id,
      category_content_id
    });

    await newContent.save();
    res.status(201).json({ message: 'Tạo nội dung thư viện thành công', content: newContent });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo nội dung', error: error.message });
  }
};

// [GET] List all
exports.getAllLibraryContents = async (req, res) => {
  try {
    const contents = await LibraryContent.find().populate('user_id topic_category_id category_content_id');
    res.status(200).json(contents);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nội dung', error: error.message });
  }
};

// [GET] Detail by ID
exports.getLibraryContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await LibraryContent.findById(id).populate('user_id topic_category_id category_content_id');
    if (!content) return res.status(404).json({ message: 'Nội dung không tồn tại' });
    res.status(200).json(content);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy nội dung', error: error.message });
  }
};

// [PUT] Update
exports.updateLibraryContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await LibraryContent.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Nội dung không tồn tại' });

    res.status(200).json({ message: 'Cập nhật thành công', content: updated });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};

// [DELETE]
exports.deleteLibraryContent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LibraryContent.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Nội dung không tồn tại' });
    res.status(200).json({ message: 'Xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
  }
};
