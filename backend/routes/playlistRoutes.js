const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const auth = require('../middleware/auth');
const ownerCheck = require('../middleware/ownerCheck');
const { validateBody } = require('../middleware/validate');
const Joi = require('joi');

const playlistMetaSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  isPublic: Joi.boolean(),
  coverUrl: Joi.string()
});

// POST /playlists (protected)
router.post('/', auth, playlistController.createPlaylist);

// GET /playlists/me (protected)
router.get('/me', auth, playlistController.getMyPlaylists);

// GET /playlists/public
router.get('/public', playlistController.getPublicPlaylists);

// GET /playlists/:id
router.get('/:id', playlistController.getPlaylistById);

// PUT /playlists/:id (owner only)
router.put('/:id', auth, ownerCheck(require('../models/Playlist'), 'id'), validateBody(playlistMetaSchema), playlistController.updatePlaylistMeta);

// DELETE /playlists/:id
router.delete('/:id', auth, ownerCheck(require('../models/Playlist'), 'id'), playlistController.deletePlaylist);

// POST /playlists/:id/songs
router.post('/:id/songs', auth, playlistController.addSongToPlaylist);

// DELETE /playlists/:id/songs/:songId
router.delete('/:id/songs/:songId', auth, playlistController.removeSongFromPlaylist);

module.exports = router;
