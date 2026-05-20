const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'moodify_super_secret_key_123';
const COOKIE_NAME = 'jwt_token';
const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, CLEAR_COOKIE_OPTIONS);
}

async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.email) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const db = await getDb();
    const result = await db.query(
      'SELECT email, name, age, preferred_singers FROM users WHERE email = $1',
      [decoded.email]
    );
    const user = result.rows[0];

    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Not authenticated' });
    }

    req.user = {
      email: user.email,
      name: user.name,
      age: user.age,
      preferredSingers: user.preferred_singers ? JSON.parse(user.preferred_singers) : []
    };

    return next();
  } catch {
    clearAuthCookie(res);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth, clearAuthCookie };
