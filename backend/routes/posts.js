const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure upload folders exist
const uploadDirs = ['uploads', 'uploads/posts', 'uploads/stories', 'uploads/profile'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'posts'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET /api/posts/feed
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p
       INNER JOIN users u ON p.user_id = u.id
       WHERE p.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = ?
       ) OR p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id, req.user.id, req.user.id]
    );
    res.json(posts);
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/posts/popular — all posts by likes (shown when feed is empty)
router.get('/popular', authMiddleware, async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p
       INNER JOIN users u ON p.user_id = u.id
       ORDER BY likes_count DESC, p.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(posts);
  } catch (err) {
    console.error('Popular posts error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/posts/user/:userId
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.*, u.username, u.profile_picture,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p
       INNER JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id, req.params.userId]
    );
    res.json(posts);
  } catch (err) {
    console.error('User posts error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/posts
router.post('/', authMiddleware, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const { caption } = req.body;
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const mediaUrl = '/uploads/posts/' + req.file.filename;

    const [result] = await db.query(
      'INSERT INTO posts (user_id, caption, media_url, media_type) VALUES (?, ?, ?, ?)',
      [req.user.id, caption || null, mediaUrl, mediaType]
    );
    res.status(201).json({ message: 'Post created!', postId: result.insertId });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (post.length === 0) return res.status(404).json({ message: 'Post not found.' });
    if (post[0].user_id !== req.user.id) return res.status(403).json({ message: 'Not your post.' });
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;