const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure uploads/messages folder exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'messages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ─────────────────────────────
// GET MESSAGES
// ─────────────────────────────
router.get('/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );
    if (conv.length === 0) return res.status(403).json({ message: 'Access denied.' });

    const [messages] = await db.query(
      `SELECT id, conversation_id, sender_id, content, media_url, is_read, created_at
       FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
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

// ─────────────────────────────
// TEXT MESSAGE
// ─────────────────────────────
router.post('/:conversationId', authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty.' });

  try {
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );
    if (conv.length === 0) return res.status(403).json({ message: 'Access denied.' });

    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversationId, req.user.id, content.trim()]
    );

    const [newMessage] = await db.query(
      `SELECT id, conversation_id, sender_id, content, media_url, is_read, created_at
       FROM messages WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─────────────────────────────
// MEDIA / VOICE NOTES
// ─────────────────────────────
router.post('/:conversationId/media', authMiddleware, upload.single('media'), async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [conv] = await db.query(
      'SELECT id FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)',
      [conversationId, req.user.id, req.user.id]
    );
    if (conv.length === 0) return res.status(403).json({ message: 'Access denied.' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const mediaUrl = '/uploads/messages/' + req.file.filename;
    const isVoice = req.file.mimetype.startsWith('audio');
    const content = isVoice ? '🎤 Voice note' : '📎 Media';

    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, content, media_url) VALUES (?, ?, ?, ?)',
      [conversationId, req.user.id, content, mediaUrl]
    );

    const [newMessage] = await db.query(
      `SELECT id, conversation_id, sender_id, content, media_url, is_read, created_at
       FROM messages WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;