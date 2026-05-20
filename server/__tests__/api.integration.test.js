jest.mock('../services/moodService');
jest.mock('../services/youtubeService');
jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => {
    if (!req.headers['x-test-auth']) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    req.user = { email: 'test@example.com', name: 'Test', age: 20, preferredSingers: [] };
    next();
  },
  clearAuthCookie: jest.fn()
}));
jest.mock('../controllers/playlistController', () => ({
  getUserPlaylists: (req, res) => res.json({ playlists: [{ id: 1, name: 'Mock List' }] }),
  createPlaylist: (req, res) => {
    if (!req.body?.name?.trim()) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }
    return res.json({ playlist: { id: 2, name: req.body.name.trim() } });
  },
  addSongToPlaylist: jest.fn(),
  removeSongFromPlaylist: jest.fn(),
  deletePlaylist: jest.fn(),
  updatePlaylist: jest.fn()
}));

const request = require('supertest');
const moodService = require('../services/moodService');
const youtubeService = require('../services/youtubeService');
const { createApp } = require('../createApp');

const mockSongs = [
  { videoId: 'a', title: 'Song A', artist: 'Artist A' },
  { videoId: 'b', title: 'Song B', artist: 'Artist B' },
  { videoId: 'c', title: 'Song C', artist: 'Artist C' },
  { videoId: 'd', title: 'Song D', artist: 'Artist D' }
];

describe('API integration (minimal routes)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    moodService.getMoodFromImage.mockResolvedValue('Happiness');
    youtubeService.getVideosForMood.mockResolvedValue(mockSongs);
  });

  describe('GET /', () => {
    it('returns health message', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Orchestration Server');
    });
  });

  describe('POST /api/music/analyze', () => {
    it('returns 400 when image is missing', async () => {
      const res = await request(app).post('/api/music/analyze').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/image/i);
    });

    it('runs mood detection and returns songs', async () => {
      const res = await request(app)
        .post('/api/music/analyze')
        .send({ image: 'data:image/jpeg;base64,YWJjZGVm' });

      expect(res.status).toBe(200);
      expect(moodService.getMoodFromImage).toHaveBeenCalledWith('data:image/jpeg;base64,abc');
      expect(youtubeService.getVideosForMood).toHaveBeenCalledWith('Happiness');
      expect(res.body).toEqual({
        mood: 'Happiness',
        songs: mockSongs,
        videoIds: ['a', 'b', 'c', 'd']
      });
    });
  });

  describe('POST /api/music/refresh', () => {
    it('returns 400 when mood is missing', async () => {
      const res = await request(app).post('/api/music/refresh').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/mood/i);
    });

    it('returns refreshed playlist for mood', async () => {
      const res = await request(app)
        .post('/api/music/refresh')
        .send({ mood: 'Calm' });

      expect(res.status).toBe(200);
      expect(youtubeService.getVideosForMood).toHaveBeenCalledWith('Calm');
      expect(res.body.mood).toBe('Calm');
      expect(res.body.songs).toHaveLength(4);
    });
  });

  describe('GET /api/playlists', () => {
    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/playlists');
      expect(res.status).toBe(401);
    });

    it('returns playlists when authenticated', async () => {
      const res = await request(app)
        .get('/api/playlists')
        .set('x-test-auth', '1');

      expect(res.status).toBe(200);
      expect(res.body.playlists).toHaveLength(1);
      expect(res.body.playlists[0].name).toBe('Mock List');
    });
  });

  describe('POST /api/playlists/create', () => {
    it('validates playlist name', async () => {
      const res = await request(app)
        .post('/api/playlists/create')
        .set('x-test-auth', '1')
        .send({ name: '   ' });

      expect(res.status).toBe(400);
    });

    it('creates playlist when authenticated', async () => {
      const res = await request(app)
        .post('/api/playlists/create')
        .set('x-test-auth', '1')
        .send({ name: 'Focus Flow' });

      expect(res.status).toBe(200);
      expect(res.body.playlist.name).toBe('Focus Flow');
    });
  });
});
