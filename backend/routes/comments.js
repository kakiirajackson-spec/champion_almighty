const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/comments/:postId
router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT c.*, u.username, u.profile_picture
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/comments/:postId
router.post('/:postId', authMiddleware, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Comment cannot be empty.' });
  try {
    const [result] = await db.query(
      'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
      [req.user.id, req.params.postId, content]
    );
    res.status(201).json({ message: 'Comment added!', commentId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;