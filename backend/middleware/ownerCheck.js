module.exports = (model, idField = 'id') => async (req, res, next) => {
  const doc = await model.findById(req.params[idField]);
  if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
  if (!doc.owner.equals(req.user.userId) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  req.doc = doc;
  next();
};
