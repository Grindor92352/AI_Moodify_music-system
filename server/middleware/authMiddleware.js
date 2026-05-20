const {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  verifyAccessToken,
  rotateSession
} = require('../services/authTokenService');
const { loadUserProfile } = require('../services/userService');

async function attachUser(req, email) {
  const profile = await loadUserProfile(email);
  if (!profile) {
    return null;
  }
  req.user = profile;
  return profile;
}

async function requireAuth(req, res, next) {
  const accessToken = req.cookies?.[ACCESS_COOKIE];
  const legacyToken = req.cookies?.jwt_token;

  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      const profile = await attachUser(req, decoded.email);
      if (!profile) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Not authenticated' });
      }
      return next();
    } catch (err) {
      if (err.name !== 'TokenExpiredError') {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }
  } else if (legacyToken) {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Session expired — please sign in again' });
  }

  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const email = await rotateSession(res, refreshToken);
    const profile = await attachUser(req, email);
    if (!profile) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return next();
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ error: 'Not authenticated' });
  }
}

module.exports = { requireAuth, clearAuthCookies };
