const Joi = require('joi');

exports.validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(422).json({ success: false, message: error.details[0].message });
  next();
};

exports.validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params);
  if (error) return res.status(422).json({ success: false, message: error.details[0].message });
  next();
};
