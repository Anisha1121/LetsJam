const multer = require('multer');
const path = require('path');

let upload;

const hasS3 = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;

if (hasS3) {
  const multerS3 = require('multer-s3');
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });

  upload = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_S3_BUCKET,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      acl: 'public-read',
      key: function (req, file, cb) {
        let folder = file.fieldname === 'audio' ? 'audio/' : 'image/';
        cb(null, folder + Date.now() + '-' + file.originalname);
      },
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max for any file, checked in fileFilter
    },
    fileFilter: function (req, file, cb) {
      if (file.fieldname === 'audio') {
        if (!file.mimetype.startsWith('audio/')) return cb(new Error('Invalid audio file type'), false);
        if (file.size > 50 * 1024 * 1024) return cb(new Error('Audio file too large'), false);
      }
      if (file.fieldname === 'cover') {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Invalid image file type'), false);
        if (file.size > 5 * 1024 * 1024) return cb(new Error('Image file too large'), false);
      }
      cb(null, true);
    },
  });
} else {
  // Local storage fallback
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let folder = file.fieldname === 'audio' ? 'uploads/audio/' : 'uploads/image/';
      cb(null, path.join(__dirname, '..', folder));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });

  upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB max for any file, checked in fileFilter
    },
    fileFilter: function (req, file, cb) {
      if (file.fieldname === 'audio') {
        if (!file.mimetype.startsWith('audio/')) return cb(new Error('Invalid audio file type'), false);
        if (file.size > 50 * 1024 * 1024) return cb(new Error('Audio file too large'), false);
      }
      if (file.fieldname === 'cover') {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Invalid image file type'), false);
        if (file.size > 5 * 1024 * 1024) return cb(new Error('Image file too large'), false);
      }
      cb(null, true);
    },
  });
}

const uploadSongAssets = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

module.exports = { uploadSongAssets };
