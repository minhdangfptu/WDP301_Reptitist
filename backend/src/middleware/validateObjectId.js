const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  const id = req.params.transaction_id || req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  next();
};

module.exports = validateObjectId;
