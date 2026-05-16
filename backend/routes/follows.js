const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// POST /api/follows/:userId
router.post('/:userId', authMiddleware, async (req, res) => {
  const followingId = req.params.userId;
  const followerId = req.user.id;
  if (followerId == followingId) return res.status(400).json({ message: 'You cannot follow yourself.' });
  try {
    await db.query('INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
    const [mutual] = await db.query('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?', [followingId, followerId]);
    if (mutual.length > 0) {
      const user1 = Math.min(followerId, followingId);
      const user2 = Math.max(followerId, followingId);
      await db.query('INSERT IGNORE INTO conversations (user1_id, user2_id) VALUES (?, ?)', [user1, user2]);
    }
    res.json({ message: 'Followed!', mutual: mutual.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/follows/:userId
router.delete('/:userId', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.userId]);
    res.json({ message: 'Unfollowed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/follows/my/followers
router.get('/my/followers', authMiddleware, async (req, res) => {
  try {
    const [followers] = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.status
       FROM follows f INNER JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ? AND u.id != ?`, [req.user.id, req.user.id]
    );
    res.json(followers);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// GET /api/follows/my/following
router.get('/my/following', authMiddleware, async (req, res) => {
  try {
    const [following] = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.status
       FROM follows f INNER JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ? AND u.id != ?`, [req.user.id, req.user.id]
    );
    res.json(following);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// GET /api/follows/check/:userId
router.get('/check/:userId', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.userId]
    );
    res.json({ isFollowing: result.length > 0 });
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// GET /api/follows/followers/:userId — get another user's followers
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  try {
    const [followers] = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.status
       FROM follows f INNER JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ? AND u.id != ?`, [req.params.userId, req.params.userId]
    );
    res.json(followers);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// GET /api/follows/following/:userId — get another user's following
router.get('/following/:userId', authMiddleware, async (req, res) => {
  try {
    const [following] = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.status
       FROM follows f INNER JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ? AND u.id != ?`, [req.params.userId, req.params.userId]
    );
    res.json(following);
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

module.exports = router;