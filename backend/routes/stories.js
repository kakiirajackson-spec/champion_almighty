const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { uploadStory } = require('../cloudinary');

// GET /api/stories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [stories] = await db.query(
      `SELECT s.*, u.username, u.profile_picture
       FROM stories s INNER JOIN users u ON s.user_id = u.id
       WHERE (s.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) OR s.user_id = ?)
       AND s.expires_at > NOW() ORDER BY s.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(stories);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error.' }); }
});

// POST /api/stories — Cloudinary upload
router.post('/', authMiddleware, uploadStory.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const mediaUrl = req.file.path;
    const mediaType = req.file.mimetype?.startsWith('video') ? 'video' : 'image';
    await db.query(
      'INSERT INTO stories (user_id, media_url, media_type) VALUES (?, ?, ?)',
      [req.user.id, mediaUrl, mediaType]
    );
    res.status(201).json({ message: 'Story posted!' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error: ' + err.message }); }
});

module.exports = router;