const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  isPublic: { type: Boolean, default: true },
  coverUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
