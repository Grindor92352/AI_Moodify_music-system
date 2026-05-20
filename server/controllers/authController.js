const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { clearAuthCookie } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'moodify_super_secret_key_123';
const COOKIE_NAME = 'jwt_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateCookie = (res, email, name) => {
  const token = jwt.sign({ email, name: name || null }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

exports.signup = async (req, res) => {
  try {
    const { password, name, age, preferredSingers } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    
    const db = await getDb();
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Securely hash the password before saving to DB
    const hashedPassword = await bcrypt.hash(password, 10);
    const singersStr = preferredSingers ? JSON.stringify(preferredSingers) : null;
    
    await db.query(
      'INSERT INTO users (email, password, name, age, preferred_singers) VALUES ($1, $2, $3, $4, $5)',
      [email, hashedPassword, name || null, age || null, singersStr || null]
    );
    
    generateCookie(res, email, name);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const db = await getDb();
    let result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    generateCookie(res, email, user.name || null);
    res.status(200).json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.verify = (req, res) => {
  res.status(200).json({ ...req.user, valid: true });
};

exports.googleAuth = (req, res) => {
  res.status(501).json({ error: 'Google sign-in is not configured yet' });
};
