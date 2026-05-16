const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure folder exists
if (!fs.existsSync(path.join(__dirname, '..', 'uploads', 'stories'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'uploads', 'stories'), { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'stories'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET /api/stories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [stories] = await db.query(
      `SELECT s.*, u.username, u.profile_picture
       FROM stories s
       INNER JOIN users u ON s.user_id = u.id
       WHERE (s.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = ?
       ) OR s.user_id = ?)
       AND s.expires_at > NOW()
       ORDER BY s.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(stories);
  } catch (err) {
    console.error('Stories error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/stories
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const mediaUrl = '/uploads/stories/' + req.file.filename;
    await db.query(
      'INSERT INTO stories (user_id, media_url, media_type) VALUES (?, ?, ?)',
      [req.user.id, mediaUrl, mediaType]
    );
    res.status(201).json({ message: 'Story posted!' });
  } catch (err) {
    console.error('Create story error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;