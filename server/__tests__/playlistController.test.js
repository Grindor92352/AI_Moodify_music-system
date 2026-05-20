jest.mock('../database', () => ({
  pool: { query: jest.fn() }
}));

const { pool } = require('../database');
const playlistController = require('../controllers/playlistController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('playlistController', () => {
  const user = { email: 'user@test.com', name: 'Test', age: 20, preferredSingers: [] };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPlaylists', () => {
    it('returns playlists with nested songs', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            name: 'Chill Mix',
            description: 'Relax',
            created_at: '2026-01-01',
            song_count: '2'
          }]
        })
        .mockResolvedValueOnce({
          rows: [
            { video_id: 'vid1', title: 'Song 1', artist: 'Artist 1', added_at: '2026-01-02' }
          ]
        });

      const req = { user };
      const res = mockRes();

      await playlistController.getUserPlaylists(req, res);

      expect(res.json).toHaveBeenCalledWith({
        playlists: [{
          id: 1,
          name: 'Chill Mix',
          description: 'Relax',
          createdAt: '2026-01-01',
          songCount: 2,
          songs: [{
            videoId: 'vid1',
            title: 'Song 1',
            artist: 'Artist 1',
            addedAt: '2026-01-02'
          }]
        }]
      });
    });

    it('returns 500 on database error', async () => {
      pool.query.mockRejectedValue(new Error('db down'));
      const req = { user };
      const res = mockRes();

      await playlistController.getUserPlaylists(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch playlists' });
    });
  });

  describe('createPlaylist', () => {
    it('creates playlist and returns formatted payload', async () => {
      pool.query.mockResolvedValue({
        rows: [{
          id: 5,
          name: 'Workout',
          description: 'Energy',
          created_at: '2026-05-01'
        }]
      });

      const req = { user, validated: { name: 'Workout', description: 'Energy' } };
      const res = mockRes();

      await playlistController.createPlaylist(req, res);

      expect(pool.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        playlist: {
          id: 5,
          name: 'Workout',
          description: 'Energy',
          createdAt: '2026-05-01',
          songCount: 0,
          songs: []
        }
      });
    });
  });

  describe('addSongToPlaylist', () => {
    it('returns 400 when required song fields are missing', async () => {
      const req = { user, validated: { playlistId: '1', videoId: 'x' } };
      const res = mockRes();

      await playlistController.addSongToPlaylist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'videoId, title, and artist are required' });
    });

    it('returns 404 when playlist does not belong to user', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });
      const req = {
        user,
        validated: { playlistId: '99', videoId: 'v', title: 'T', artist: 'A' }
      };
      const res = mockRes();

      await playlistController.addSongToPlaylist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Playlist not found' });
    });

    it('returns 400 when song already exists', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ id: 10 }] });

      const req = {
        user,
        validated: { playlistId: '1', videoId: 'dup', title: 'T', artist: 'A' }
      };
      const res = mockRes();

      await playlistController.addSongToPlaylist(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Song already exists in playlist' });
    });

    it('adds song successfully', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const req = {
        user,
        validated: { playlistId: '1', videoId: 'new', title: 'New Song', artist: 'Artist' }
      };
      const res = mockRes();

      await playlistController.addSongToPlaylist(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Song added to playlist successfully' });
    });
  });

  describe('deletePlaylist', () => {
    it('returns 404 when playlist not found', async () => {
      pool.query.mockResolvedValue({ rowCount: 0 });
      const req = { user, validated: { playlistId: '1' } };
      const res = mockRes();

      await playlistController.deletePlaylist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deletes playlist successfully', async () => {
      pool.query.mockResolvedValue({ rowCount: 1 });
      const req = { user, validated: { playlistId: '1' } };
      const res = mockRes();

      await playlistController.deletePlaylist(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Playlist deleted successfully' });
    });
  });

  describe('updatePlaylist', () => {
    it('returns 404 when playlist not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const req = { user, validated: { playlistId: '1', name: 'Renamed' } };
      const res = mockRes();

      await playlistController.updatePlaylist(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
