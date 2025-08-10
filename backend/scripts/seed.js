const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Create test user
  const user = await User.create({ username: 'testuser', email: 'test@example.com', password: 'pass1234', role: 'artist' });

  // Create songs
  const songs = await Song.insertMany([
    { title: 'Song One', artistName: 'Artist A', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', coverUrl: '', isPublic: true },
    { title: 'Song Two', artistName: 'Artist B', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', coverUrl: '', isPublic: true },
    { title: 'Song Three', artistName: 'Artist C', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', coverUrl: '', isPublic: true },
    { title: 'Song Four', artistName: 'Artist D', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', coverUrl: '', isPublic: true },
  ]);

  // Create a sample playlist
  await Playlist.create({
    name: 'Sample Playlist',
    description: 'A test playlist',
    owner: user._id,
    songs: songs.map(s => s._id),
    isPublic: true,
    coverUrl: ''
  });

  console.log('Seed complete');
  mongoose.disconnect();
}

seed();
