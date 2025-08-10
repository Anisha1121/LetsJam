const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, coverUrl } = req.body;
    const owner = req.user.userId;
    const playlist = new Playlist({ name, description, owner, isPublic, coverUrl });
    await playlist.save();
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({ path: 'songs', select: 'title artistName coverUrl audioUrl' });
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!playlist.owner.equals(req.user.userId)) return res.status(403).json({ message: 'Forbidden' });
    const { songId } = req.body;
    if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!playlist.owner.equals(req.user.userId)) return res.status(403).json({ message: 'Forbidden' });
    playlist.songs = playlist.songs.filter(song => song.toString() !== req.params.songId);
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updatePlaylistMeta = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    if (!playlist.owner.equals(req.user.userId)) return res.status(403).json({ message: 'Forbidden' });
    const { name, description, isPublic, coverUrl } = req.body;
    if (name) playlist.name = name;
    if (description) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverUrl) playlist.coverUrl = coverUrl;
    await playlist.save();
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user.userId });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPublicPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = req.doc;
    await playlist.deleteOne();
    res.json({ success: true, message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
