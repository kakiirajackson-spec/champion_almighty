const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, full_name, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required.' });
  }

  // Username: only letters, numbers, underscores, dots — no spaces
  const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: 'Username must be 3-30 characters and can only contain letters, numbers, dots and underscores.' });
  }

  try {
    // Check if email or username already taken
    const [existing] = await db.query(
      'SELECT id, username, email FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0) {
      const taken = existing[0].email === email ? 'Email' : 'Username';
      return res.status(409).json({ message: `${taken} is already taken.` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, full_name, email, password) VALUES (?, ?, ?, ?)',
      [username, full_name || null, email, hashedPassword]
    );

    res.status(201).json({ message: 'Account created!', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/login — accepts email OR username
router.post('/login', async (req, res) => {
  const { emailOrUsername, email, password } = req.body;

  // Support both old (email) and new (emailOrUsername) field
  const loginId = emailOrUsername || email;

  if (!loginId || !password) {
    return res.status(400).json({ message: 'Email/username and password are required.' });
  }

  try {
    // Try to find by email first, then by username
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [loginId, loginId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email/username or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email/username or password.' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', ['online', user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        profile_picture: user.profile_picture,
        bio: user.bio,
        status: 'online',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const { userId } = req.body;
  try {
    await db.query(
      'UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?',
      ['offline', userId]
    );
    res.json({ message: 'Logged out.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/auth/check-username?username=badman — check if username is taken
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ message: 'Username required.' });
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;