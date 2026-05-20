jest.mock('../database', () => ({
  pool: { query: jest.fn() }
}));

const { pool } = require('../database');
const historyController = require('../controllers/historyController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('historyController (normalized schema)', () => {
  const user = { email: 'user@test.com' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores mood session and tracks in separate tables', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })
      .mockResolvedValue({ rows: [] });

    const req = {
      user,
      validated: {
        mood: 'Happy',
        songs: [
          { videoId: 'abc123', title: 'Song A', artist: 'Artist A' },
          { videoId: 'def456', title: 'Song B', artist: 'Artist B' }
        ]
      }
    };
    const res = mockRes();

    await historyController.saveHistory(req, res);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO mood_history'),
      ['user@test.com', 'Happy']
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO mood_history_tracks'),
      expect.arrayContaining([42, 'abc123', 'Song A', 'Artist A', 0])
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('loads tracks via join query per session', async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{ id: 1, mood: 'Calm', detected_at: new Date('2026-01-01') }]
      })
      .mockResolvedValueOnce({
        rows: [{ video_id: 'v1', title: 'Track 1', artist: 'A1', position: 0 }]
      });

    const req = { user };
    const res = mockRes();

    await historyController.getHistory(req, res);

    expect(res.json).toHaveBeenCalledWith({
      history: [{
        id: 1,
        mood: 'Calm',
        songs: [{ videoId: 'v1', title: 'Track 1', artist: 'A1' }],
        videoIds: ['v1'],
        date: expect.any(String),
        tracks: 1
      }]
    });
  });
});
