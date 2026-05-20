jest.mock('axios');

const axios = require('axios');
const moodService = require('../services/moodService');

const FALLBACK_MOODS = ['Happiness', 'Sadness', 'Stress', 'Anger', 'Anxiety', 'Fatigue'];

describe('moodService.getMoodFromImage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns dominant_mood from AI pipeline on success', async () => {
    axios.post.mockResolvedValue({
      data: { dominant_mood: 'Happiness' }
    });

    const mood = await moodService.getMoodFromImage('base64-image-data');

    expect(mood).toBe('Happiness');
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/analyze-frame',
      { image_base64: 'base64-image-data' },
      { timeout: 10000 }
    );
  });

  it('uses AI_PIPELINE_URL when set', async () => {
    process.env.AI_PIPELINE_URL = 'http://pipeline.test';
    axios.post.mockResolvedValue({ data: { dominant_mood: 'Stress' } });

    await moodService.getMoodFromImage('img');

    expect(axios.post).toHaveBeenCalledWith(
      'http://pipeline.test/analyze-frame',
      { image_base64: 'img' },
      { timeout: 10000 }
    );
  });

  it('returns a fallback mood when pipeline reports soft error', async () => {
    axios.post.mockResolvedValue({ data: { error: 'no face' } });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const mood = await moodService.getMoodFromImage('img');

    expect(FALLBACK_MOODS).toContain(mood);
    randomSpy.mockRestore();
  });

  it('returns a fallback mood on unexpected schema', async () => {
    axios.post.mockResolvedValue({ data: {} });
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);

    const mood = await moodService.getMoodFromImage('img');

    expect(FALLBACK_MOODS).toContain(mood);
    randomSpy.mockRestore();
  });

  it('returns a fallback mood when pipeline connection fails', async () => {
    axios.post.mockRejectedValue(new Error('ECONNREFUSED'));
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const mood = await moodService.getMoodFromImage('img');

    expect(FALLBACK_MOODS).toContain(mood);
    randomSpy.mockRestore();
  });
});
