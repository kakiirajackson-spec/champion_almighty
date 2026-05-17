const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { uploadAvatar } = require('../cloudinary');

router.get('/search', authMiddleware, async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Username required.' });
  try {
    const [users] = await db.query(
      `SELECT id, username, email, profile_picture, bio, status FROM users WHERE username LIKE ? AND id != ?`,
      [`%${username}%`, req.user.id]
    );
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, profile_picture, bio, status FROM users WHERE id != ?`, [req.user.id]
    );
    res.json(users);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.profile_picture, u.bio, u.status, u.last_seen, u.created_at,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count
       FROM users u WHERE u.id = ?`, [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(users[0]);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, u.profile_picture, u.bio, u.status, u.last_seen,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS posts_count
       FROM users u WHERE u.id = ?`, [req.params.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(users[0]);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.put('/me', authMiddleware, async (req, res) => {
  const { username, bio, profile_picture } = req.body;
  try {
    await db.query(
      'UPDATE users SET username = COALESCE(?, username), bio = COALESCE(?, bio), profile_picture = COALESCE(?, profile_picture) WHERE id = ?',
      [username || null, bio || null, profile_picture || null, req.user.id]
    );
    res.json({ message: 'Profile updated.' });
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

router.post('/me/avatar', authMiddleware, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const avatarUrl = req.file.path;
    await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ message: 'Avatar updated!', profile_picture: avatarUrl });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;