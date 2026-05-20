jest.mock('../services/authTokenService');
jest.mock('../services/userService');

const authTokenService = require('../services/authTokenService');
const { loadUserProfile } = require('../services/userService');
const { requireAuth } = require('../middleware/authMiddleware');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const profile = {
  email: 'user@test.com',
  name: 'Test User',
  age: 25,
  preferredSingers: ['Arijit Singh']
};

describe('authMiddleware.requireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadUserProfile.mockResolvedValue(profile);
  });

  it('returns 401 when no tokens are present', async () => {
    const req = { cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user when access token is valid', async () => {
    authTokenService.verifyAccessToken.mockReturnValue({ email: 'user@test.com' });
    const req = { cookies: { access_token: 'access' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(req.user).toEqual(profile);
    expect(next).toHaveBeenCalled();
  });

  it('rotates session when access token is expired but refresh is valid', async () => {
    const err = new Error('expired');
    err.name = 'TokenExpiredError';
    authTokenService.verifyAccessToken.mockImplementation(() => { throw err; });
    authTokenService.rotateSession.mockResolvedValue('user@test.com');

    const req = { cookies: { access_token: 'expired', refresh_token: 'refresh' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(authTokenService.rotateSession).toHaveBeenCalledWith(res, 'refresh');
    expect(req.user).toEqual(profile);
    expect(next).toHaveBeenCalled();
  });

  it('rejects legacy jwt_token cookie without refresh', async () => {
    const req = { cookies: { jwt_token: 'legacy' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAuth(req, res, next);

    expect(authTokenService.clearAuthCookies).toHaveBeenCalledWith(res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
