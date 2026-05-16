const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// POST /api/likes/:postId - like a post
router.post('/:postId', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)',
      [req.user.id, req.params.postId]
    );
    res.json({ message: 'Liked!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/likes/:postId - unlike a post
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      [req.user.id, req.params.postId]
    );
    res.json({ message: 'Unliked!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;