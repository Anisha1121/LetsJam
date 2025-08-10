const mongoose = require('mongoose');

const playEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlayEvent', playEventSchema);
