const moodService = require('../services/moodService');
const youtubeService = require('../services/youtubeService');

/**
 * POST /api/music/analyze
 * Full pipeline: receives a base64 image, detects mood via AI, returns songs.
 */
exports.generatePlaylist = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Empty or invalid image payload.' });
    }

    // Phase 1: Detect mood from facial expression via Python AI pipeline
    const dominantMood = await moodService.getMoodFromImage(image);

    // Phase 2: Get curated Bollywood songs for the detected mood (live search)
    const songs = await youtubeService.getVideosForMood(dominantMood);

    return res.json({
      mood: dominantMood,
      songs,
      videoIds: songs.map(s => s.videoId),
    });

  } catch (error) {
    if (
      error.message.includes('No face detected') ||
      error.message.includes('missing from payload')
    ) {
      return res.json({ mood: null, songs: [], videoIds: [] });
    }

    console.error('[Analyze] Pipeline error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/music/refresh
 * Lightweight refresh: skips the camera/AI phase entirely.
 * Accepts { mood } and returns a fresh shuffled song batch.
 */
exports.refreshPlaylist = async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'mood is required for refresh.' });
    }

    const songs = await youtubeService.getVideosForMood(mood);
    console.log(`[Refresh] New batch for mood "${mood}": ${songs.map(s => s.title).join(', ')}`);

    return res.json({
      mood,
      songs,
      videoIds: songs.map(s => s.videoId),
    });

  } catch (error) {
    console.error('[Refresh] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
