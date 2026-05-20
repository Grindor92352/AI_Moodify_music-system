const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');
const { cookieOptionsWithMaxAge, baseCookieOptions } = require('../utils/cookies');

const DEFAULT_JWT_SECRET = 'moodify_super_secret_key_123';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (process.env.NODE_ENV === 'production' && JWT_SECRET === DEFAULT_JWT_SECRET) {
  console.warn('[Auth] WARNING: Set a strong JWT_SECRET environment variable in production.');
}
const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const REFRESH_MAX_AGE_MS = REFRESH_DAYS * 24 * 60 * 60 * 1000;
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken() {
  return crypto.randomBytes(32).toString('hex');
}

function signAccessToken(email, name) {
  return jwt.sign(
    { email, name: name || null, type: 'access' },
    JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptionsWithMaxAge(ACCESS_MAX_AGE_MS));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptionsWithMaxAge(REFRESH_MAX_AGE_MS));
}

function clearAuthCookies(res) {
  const opts = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
  res.clearCookie('jwt_token', opts);
}

async function storeRefreshToken(email, refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE_MS);
  await pool.query(
    `INSERT INTO refresh_tokens (user_email, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [email, tokenHash, expiresAt]
  );
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  const tokenHash = hashToken(refreshToken);
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
}

async function revokeAllUserRefreshTokens(email) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = NOW()
     WHERE user_email = $1 AND revoked_at IS NULL`,
    [email]
  );
}

async function validateRefreshToken(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const result = await pool.query(
    `SELECT user_email, expires_at, revoked_at
     FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
  const row = result.rows[0];
  if (!row || row.revoked_at) return null;
  if (new Date(row.expires_at) < new Date()) return null;
  return row.user_email;
}

/**
 * Issues a new access + refresh pair and sets cookies.
 */
async function issueSession(res, email, name) {
  const accessToken = signAccessToken(email, name);
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(email, refreshToken);
  setAuthCookies(res, accessToken, refreshToken);
  return { accessToken, refreshToken };
}

/**
 * Rotates refresh token (one-time use) and issues a new session.
 */
async function rotateSession(res, refreshToken) {
  const email = await validateRefreshToken(refreshToken);
  if (!email) {
    throw new Error('Invalid refresh token');
  }
  await revokeRefreshToken(refreshToken);

  const userResult = await pool.query(
    'SELECT email, name FROM users WHERE email = $1',
    [email]
  );
  const user = userResult.rows[0];
  if (!user) {
    throw new Error('User not found');
  }

  await issueSession(res, user.email, user.name);
  return user.email;
}

function verifyAccessToken(token) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded.email || decoded.type !== 'access') {
    throw new Error('Invalid access token');
  }
  return decoded;
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE_MS,
  REFRESH_MAX_AGE_MS,
  signAccessToken,
  setAuthCookies,
  clearAuthCookies,
  issueSession,
  rotateSession,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  validateRefreshToken,
  verifyAccessToken
};
