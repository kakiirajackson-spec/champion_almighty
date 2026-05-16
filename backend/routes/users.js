const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Profile picture upload setup
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'profile');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadProfile = multer({ storage: profileStorage });

// GET /api/users/search?q=john
router.get('/search', authMiddleware, async (req, res) => {
  const q = req.query.q || req.query.username;
  if (!q) return res.status(400).json({ message: 'Search query is required.' });
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, email, profile_picture, bio, status
       FROM users WHERE username LIKE ? AND id != ?`,
      [`%${q}%`, req.user.id]
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/users/all — all users except me (for suggested users)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, profile_picture, bio, status
       FROM users WHERE id != ?
       ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/users/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.profile_picture, u.bio, u.status, u.last_seen, u.created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count
       FROM users u WHERE u.id = ?`,
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/users/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.profile_picture, u.bio, u.status, u.last_seen,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count
       FROM users u WHERE u.id = ?`,
      [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/me
router.put('/me', authMiddleware, async (req, res) => {
  const { username, bio } = req.body;
  try {
    await db.query(
      'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio) WHERE id = ?',
      [username || null, bio || null, req.user.id]
    );
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/users/me/avatar
router.post('/me/avatar', authMiddleware, uploadProfile.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const avatarUrl = '/uploads/profile/' + req.file.filename;
  try {
    await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ profile_picture: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;