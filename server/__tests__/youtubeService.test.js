jest.mock('axios');

const axios = require('axios');
const youtubeService = require('../services/youtubeService');

describe('youtubeService.getVideosForMood', () => {
  const originalApiKey = process.env.YOUTUBE_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.YOUTUBE_API_KEY;
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.YOUTUBE_API_KEY;
    } else {
      process.env.YOUTUBE_API_KEY = originalApiKey;
    }
  });

  it('returns 4 songs from static fallback when API key is missing', async () => {
    const songs = await youtubeService.getVideosForMood('happy');

    expect(songs).toHaveLength(4);
    songs.forEach(song => {
      expect(song).toMatchObject({
        videoId: expect.any(String),
        title: expect.any(String),
        artist: expect.any(String)
      });
    });
  });

  it('maps sadness mood to nostalgic static library', async () => {
    const songs = await youtubeService.getVideosForMood('sadness');
    const titles = songs.map(s => s.title);

    expect(titles).toContain('Tum Hi Ho');
  });

  it('returns live API results when key is present', async () => {
    process.env.YOUTUBE_API_KEY = 'test-key';
    axios.get.mockResolvedValue({
      data: {
        items: [
          { id: { videoId: 'abc123' }, snippet: { title: 'Live Song', channelTitle: 'Channel A' } },
          { id: { videoId: 'def456' }, snippet: { title: 'Another Song', channelTitle: 'Channel B' } },
          { id: { videoId: 'ghi789' }, snippet: { title: 'Third Song', channelTitle: 'Channel C' } },
          { id: { videoId: 'jkl012' }, snippet: { title: 'Fourth Song', channelTitle: 'Channel D' } },
          { id: { videoId: 'mno345' }, snippet: { title: 'Fifth Song', channelTitle: 'Channel E' } }
        ]
      }
    });

    const songs = await youtubeService.getVideosForMood('party');

    expect(axios.get).toHaveBeenCalled();
    expect(songs).toHaveLength(4);
    expect(songs[0]).toEqual(expect.objectContaining({
      videoId: expect.any(String),
      title: expect.any(String),
      artist: expect.any(String)
    }));
  });

  it('falls back to static library when API returns no items', async () => {
    process.env.YOUTUBE_API_KEY = 'test-key';
    axios.get.mockResolvedValue({ data: { items: [] } });

    const songs = await youtubeService.getVideosForMood('anxiety');

    expect(songs).toHaveLength(4);
    expect(songs.every(s => s.videoId)).toBe(true);
  });

  it('falls back to static library when API request fails', async () => {
    process.env.YOUTUBE_API_KEY = 'test-key';
    axios.get.mockRejectedValue(new Error('quota exceeded'));

    const songs = await youtubeService.getVideosForMood('stress');

    expect(songs).toHaveLength(4);
  });
});
