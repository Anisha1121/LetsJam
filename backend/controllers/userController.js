const Song = require('../models/Song');
const User = require('../models/User');

// Get liked songs (library)
exports.getMyLibrary = async (req, res) => {
  try {
    // For demo, assume User model has likedSongs: [SongId]
    const user = await User.findById(req.user.userId).populate({ path: 'likedSongs', select: 'title artistName coverUrl audioUrl' });
    res.json(user.likedSongs || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get stats
exports.getStats = async (req, res) => {
  try {
    // Top 10 most played (global)
    const topPlayed = await Song.find().sort('-plays').limit(10).select('title artistName coverUrl audioUrl plays');
    // User's most played (assume User model has playHistory: [{ songId, timestamp }])
    const user = await User.findById(req.user.userId);
    const playCounts = {};
    (user.playHistory || []).forEach(h => {
      playCounts[h.songId] = (playCounts[h.songId] || 0) + 1;
    });
    const userMostPlayedId = Object.keys(playCounts).sort((a, b) => playCounts[b] - playCounts[a])[0];
    const userMostPlayed = userMostPlayedId ? await Song.findById(userMostPlayedId).select('title artistName coverUrl audioUrl plays') : null;
    // Last listened timestamps
    const lastListened = user.playHistory || [];
    res.json({ topPlayed, userMostPlayed, lastListened });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
