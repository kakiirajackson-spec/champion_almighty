const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/conversations  → get all my conversations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [conversations] = await db.query(
      `SELECT
        c.id,
        c.created_at,
        CASE WHEN c.user1_id = ? THEN u2.id ELSE u1.id END AS other_user_id,
        CASE WHEN c.user1_id = ? THEN u2.username ELSE u1.username END AS other_username,
        CASE WHEN c.user1_id = ? THEN u2.profile_picture ELSE u1.profile_picture END AS other_profile_picture,
        CASE WHEN c.user1_id = ? THEN u2.status ELSE u1.status END AS other_status,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread_count
       FROM conversations c
       INNER JOIN users u1 ON c.user1_id = u1.id
       INNER JOIN users u2 ON c.user2_id = u2.id
       WHERE c.user1_id = ? OR c.user2_id = ?
       ORDER BY last_message_time DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;