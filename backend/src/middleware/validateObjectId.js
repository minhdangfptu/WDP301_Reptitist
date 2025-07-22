const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  // Lấy các ID có thể có từ params
  const possibleIds = [
    req.params.transaction_id,
    req.params.userId, 
    req.params.id,
    req.params.productId,
    req.params.reptileId,
    req.params.shopId,
    req.params.reportId
  ].filter(Boolean); // Lọc bỏ undefined/null

  // Kiểm tra từng ID
  for (const id of possibleIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        error: `Invalid ID format: ${id}`,
        message: 'ID không hợp lệ' 
      });
    }
  }

  // Nếu không có ID nào để validate
  if (possibleIds.length === 0) {
    console.log('No IDs found to validate in request params');
  }

  next();
};

module.exports = validateObjectId;