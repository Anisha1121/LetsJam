require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songRoutes');
const userRoutes = require('./routes/userRoutes');
const playlistRoutes = require('./routes/playlistRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/playlists', playlistRoutes);

// Serve uploaded files statically
app.use('/uploads/audio', express.static(__dirname + '/uploads/audio'));
app.use('/uploads/image', express.static(__dirname + '/uploads/image'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

// Swagger setup
const setupSwagger = require('./swagger');
setupSwagger(app);

// Security middleware
const setupSecurity = require('./middleware/security');
setupSecurity(app);

// HTTP Range streaming for audio
app.get('/stream/audio/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/audio', req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// Health check
app.get('/healthz', (req, res) => {
  res.json({ success: true, message: 'Healthy' });
});

// Error handler middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
