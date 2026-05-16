const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/messages/:conversationId  → get messages in a conversation
router.get('/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Make sure user belongs to this conversation
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );
    if (conv.length === 0) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Get messages
    const [messages] = await db.query(
      `SELECT m.id, m.content, m.is_read, m.created_at,
        u.id AS sender_id, u.username AS sender_name, u.profile_picture AS sender_pic
       FROM messages m
       INNER JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, req.user.id]
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/messages/:conversationId  → send a message
router.post('/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty.' });
  }

  try {
    // Make sure user belongs to this conversation
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );
    if (conv.length === 0) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Insert message
    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, req.user.id, content.trim()]
    );

    // Return new message
    const [newMessage] = await db.query(
      `SELECT m.id, m.content, m.is_read, m.created_at,
        u.id AS sender_id, u.username AS sender_name, u.profile_picture AS sender_pic
       FROM messages m
       INNER JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;