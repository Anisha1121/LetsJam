const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artistName: { type: String, required: true },
  album: { type: String },
  duration: { type: Number }, // in seconds
  genres: [{ type: String }],
  moodTags: [{ type: String }],
  language: { type: String },
  coverUrl: { type: String },
  audioUrl: { type: String },
  storageKey: { type: String },
  bitrate: { type: Number },
  plays: { type: Number, default: 0 },
  likedCount: { type: Number, default: 0 },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

songSchema.index({ title: 'text', artistName: 'text', album: 'text' });
songSchema.index({ plays: -1 });
songSchema.index({ duration: 1 });
songSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Song', songSchema);
