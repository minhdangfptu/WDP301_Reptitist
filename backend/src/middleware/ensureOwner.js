const ensureOwnUserData = (req, res, next) => {
  if (req.userId && req.params.userId && req.userId !== req.params.userId) {
    return res.status(403).json({ message: 'No permission' });
  }
  next();
};

module.exports = { ensureOwnUserData };
