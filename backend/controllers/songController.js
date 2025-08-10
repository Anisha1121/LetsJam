// (Optional) Get download URL for premium users
exports.getDownloadUrl = async (req, res) => {
  try {
    // Check if user is premium (replace with real logic)
    const isPremium = req.user && req.user.isPremium;
    if (!isPremium) {
      return res.status(403).json({ message: 'Premium account required.' });
    }
    // Presign logic for S3 or local (placeholder)
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    // If using S3, generate presigned URL here
    // For local, just return the audioUrl
    res.json({ downloadUrl: song.audioUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const Song = require('../models/Song');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const Playlist = require('../models/Playlist');
const PlayEvent = require('../models/PlayEvent');

// Create a new song (artist/admin)
exports.createSong = async (req, res) => {
  try {
    const {
      title, artistName, album, duration, genres, moodTags, language, bitrate, isPublic
    } = req.body;
    const uploader = req.user.userId;
    const coverFile = req.files?.cover?.[0];
    const audioFile = req.files?.audio?.[0];

    if (!title || !artistName || !audioFile) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const song = new Song({
      title,
      artistName,
      album,
      duration,
      genres,
      moodTags,
      language,
      coverUrl: coverFile?.location || coverFile?.path,
      audioUrl: audioFile?.location || audioFile?.path,
      storageKey: audioFile?.key || audioFile?.filename,
      bitrate,
      uploader,
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get songs with filters and pagination
exports.getSongs = async (req, res) => {
  try {
    const { q, genre, mood, language, page = 1, limit = 20, sort = '-createdAt', 'duration.lte': durationLte, year, liked, uploader } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (genre) filter.genres = genre;
    if (mood) filter.moodTags = mood;
    if (language) filter.language = language;
    if (durationLte) filter.duration = { $lte: Number(durationLte) };
    if (year) filter.createdAt = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) };
    if (liked === 'true' && req.user) {
      // Only return songs liked by the user
      const user = await User.findById(req.user.userId);
      filter._id = { $in: user.likedSongs };
    }
    if (uploader) filter.uploader = uploader;

    // Default sort by createdAt, support sort=-plays
    let sortOption = {};
    if (sort === '-plays') sortOption = { plays: -1 };
    else if (sort === 'plays') sortOption = { plays: 1 };
    else sortOption = { createdAt: sort === '-createdAt' ? -1 : 1 };

    const songs = await Song.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get song by ID
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(song);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Increment plays
exports.incrementPlays = async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ plays: song.plays });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Toggle like
exports.toggleLike = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    // For demo: just increment/decrement likedCount
    // In production, track user likes separately
    if (req.body.like === true) {
      song.likedCount += 1;
    } else {
      song.likedCount = Math.max(0, song.likedCount - 1);
    }
    await song.save();
    res.json({ likedCount: song.likedCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSongMeta = async (req, res) => {
  try {
    const song = req.doc;
    Object.assign(song, req.body);
    await song.save();
    res.json({ success: true, data: song, message: 'Song updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSong = async (req, res) => {
  try {
    const song = req.doc;
    // Remove from playlists
    await Playlist.updateMany({}, { $pull: { songs: song._id } });
    // Delete file (local only)
    if (song.audioUrl && song.audioUrl.startsWith('http') === false) {
      const audioPath = path.join(__dirname, '..', song.audioUrl.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }
    if (song.coverUrl && song.coverUrl.startsWith('http') === false) {
      const coverPath = path.join(__dirname, '..', song.coverUrl.replace(/^.*\/uploads\//, 'uploads/'));
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }
    await song.deleteOne();
    res.json({ success: true, message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
