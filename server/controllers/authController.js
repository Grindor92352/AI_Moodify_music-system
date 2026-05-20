const bcrypt = require('bcryptjs');
const { getDb, pool } = require('../database');
const {
  issueSession,
  clearAuthCookies,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  rotateSession,
  REFRESH_COOKIE
} = require('../services/authTokenService');
const { replacePreferredSingers, loadUserProfile } = require('../services/userService');

exports.signup = async (req, res) => {
  try {
    const { password, name, age, preferredSingers } = req.validated;
    const email = req.validated.email;

    await getDb();
    const existing = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (email, password, name, age) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, name || null, age ?? null]
    );

    await replacePreferredSingers(email, preferredSingers || []);
    await issueSession(res, email, name || null);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { password } = req.validated;
    const email = req.validated.email;

    await getDb();
    const result = await pool.query('SELECT email, password, name FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await revokeAllUserRefreshTokens(email);
    await issueSession(res, user.email, user.name || null);

    res.status(200).json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  try {
    const email = await rotateSession(res, refreshToken);
    const profile = await loadUserProfile(email);
    if (!profile) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.status(200).json({ ...profile, valid: true });
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    await revokeRefreshToken(refreshToken);
    if (req.user?.email) {
      await revokeAllUserRefreshTokens(req.user.email);
    }
  } catch (err) {
    console.error('Logout revoke error:', err);
  } finally {
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out successfully' });
  }
};

exports.verify = (req, res) => {
  res.status(200).json({ ...req.user, valid: true });
};

exports.googleAuth = (req, res) => {
  res.status(501).json({ error: 'Google sign-in is not configured yet' });
};
