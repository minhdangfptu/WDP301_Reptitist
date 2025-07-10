const UpgradePlan = require('../models/Upgrade_plan');

// Lấy danh sách upgrade plan, filter by frequency (duration), sort by price
exports.getUpgradePlans = async (req, res) => {
  try {
    let { frequency, sort } = req.query;
    let filter = {};
    if (frequency) {
      filter.duration = Number(frequency);
    }
    let sortOption = {};
    if (sort === 'asc') sortOption.price = 1;
    else if (sort === 'desc') sortOption.price = -1;
    const plans = await UpgradePlan.find(filter).sort(sortOption);
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách upgrade plan', error: err.message });
  }
};

// Thêm upgrade plan
exports.createUpgradePlan = async (req, res) => {
  try {
    const { code, price, description, duration } = req.body;
    if (!code || !price || !duration) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    const plan = new UpgradePlan({ code, price, description, duration });
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo upgrade plan', error: err.message });
  }
};


// Sửa upgrade plan
exports.updateUpgradePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, price, description, duration } = req.body;
    const plan = await UpgradePlan.findByIdAndUpdate(
      id,
      { code, price, description, duration },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Không tìm thấy upgrade plan' });
    res.status(200).json(plan);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật upgrade plan', error: err.message });
  }
};

// Xóa upgrade plan
exports.deleteUpgradePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await UpgradePlan.findByIdAndDelete(id);
    if (!plan) return res.status(404).json({ message: 'Không tìm thấy upgrade plan' });
    res.status(200).json({ message: 'Đã xóa upgrade plan', plan });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xóa upgrade plan', error: err.message });
  }
}; 