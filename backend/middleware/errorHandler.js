module.exports = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate entry' });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
};
