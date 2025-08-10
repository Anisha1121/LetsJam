const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const { uploadSongAssets } = require('../middleware/uploadMiddleware');
const auth = require('../middleware/auth');
const ownerCheck = require('../middleware/ownerCheck');
const { validateBody } = require('../middleware/validate');
const Joi = require('joi');

const songMetaSchema = Joi.object({
  title: Joi.string(),
  artistName: Joi.string(),
  album: Joi.string(),
  duration: Joi.number(),
  genres: Joi.array().items(Joi.string()),
  moodTags: Joi.array().items(Joi.string()),
  language: Joi.string(),
  coverUrl: Joi.string(),
  audioUrl: Joi.string(),
  bitrate: Joi.number(),
  isPublic: Joi.boolean()
});

// Dummy restrictTo middleware
function restrictTo(...roles) {
  return (req, res, next) => {
    // Assume req.user.role is set after auth middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

// POST /songs (protected, restrict to artist/admin, uses uploadSongAssets)
router.post('/', auth, restrictTo('artist', 'admin'), uploadSongAssets, songController.createSong);

// GET /songs
router.get('/', songController.getSongs);

// GET /songs/:id
router.get('/:id', songController.getSongById);

// PATCH /songs/:id/play (protected)
router.patch('/:id/play', auth, songController.incrementPlays);

// POST /songs/:id/like (protected)
router.post('/:id/like', auth, songController.toggleLike);

// GET /songs/:id/download (protected, premium check)
router.get('/:id/download', auth, songController.getDownloadUrl);

// PUT /songs/:id (meta edits)
router.put('/:id', auth, ownerCheck(require('../models/Song'), 'id'), validateBody(songMetaSchema), songController.updateSongMeta);

// DELETE /songs/:id
router.delete('/:id', auth, ownerCheck(require('../models/Song'), 'id'), songController.deleteSong);

module.exports = router;
