const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

module.exports = (app) => {
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(xss());
  app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
  app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
  app.use('/api/v1/songs', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
};
