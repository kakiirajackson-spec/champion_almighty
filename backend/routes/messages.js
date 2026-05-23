const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { uploadPost } = require('../cloudinary'); // IMPORTANT

// ─────────────────────────────────────────────
// GET MESSAGES
// ─────────────────────────────────────────────
router.get('/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );

    if (conv.length === 0) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [messages] = await db.query(
      `SELECT 
        m.id,
        m.content,
        m.media_url,
        m.media_type,
        m.is_read,
        m.created_at,
        u.id AS sender_id,
        u.username AS sender_name,
        u.profile_picture AS sender_pic
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

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


// ─────────────────────────────────────────────
// SEND TEXT MESSAGE
// ─────────────────────────────────────────────
router.post('/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty.' });
  }

  try {
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );

    if (conv.length === 0) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, req.user.id, content.trim()]
    );

    const [newMessage] = await db.query(
      `SELECT 
        m.id,
        m.content,
        m.media_url,
        m.media_type,
        m.is_read,
        m.created_at,
        u.id AS sender_id,
        u.username AS sender_name,
        u.profile_picture AS sender_pic
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});


// ─────────────────────────────────────────────
// UPLOAD MEDIA / VOICE NOTES (FIX)
// ─────────────────────────────────────────────
router.post(
  '/:conversationId/media',
  authMiddleware,
  uploadPost.single('media'),
  async (req, res) => {
    const { conversationId } = req.params;

    try {
      const [conv] = await db.query(
        'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
        [conversationId, req.user.id, req.user.id]
      );

      if (conv.length === 0) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      const file = req.file;

      let mediaType = 'file';
      if (file.mimetype.startsWith('image')) mediaType = 'image';
      else if (file.mimetype.startsWith('video')) mediaType = 'video';
      else if (file.mimetype.startsWith('audio')) mediaType = 'audio';

      const [result] = await db.query(
        `INSERT INTO messages (conversation_id, sender_id, content, media_url, media_type)
         VALUES (?, ?, ?, ?, ?)`,
        [
          conversationId,
          req.user.id,
          mediaType === 'audio' ? '🎤 Voice note' : '',
          file.path,
          mediaType
        ]
      );

      const [newMessage] = await db.query(
        `SELECT 
          m.id,
          m.content,
          m.media_url,
          m.media_type,
          m.is_read,
          m.created_at,
          u.id AS sender_id,
          u.username AS sender_name,
          u.profile_picture AS sender_pic
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.id = ?`,
        [result.insertId]
      );

      res.status(201).json(newMessage[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error.' });
    }
  }
);

module.exports = router;