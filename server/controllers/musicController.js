const moodService = require('../services/moodService');
const youtubeService = require('../services/youtubeService');

exports.generatePlaylist = async (req, res) => {
  try {
    const { image } = req.validated;

    const dominantMood = await moodService.getMoodFromImage(image);
    const songs = await youtubeService.getVideosForMood(dominantMood);

    return res.json({
      mood: dominantMood,
      dominant_mood: dominantMood,
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

exports.refreshPlaylist = async (req, res) => {
  try {
    const { mood } = req.validated;
    const songs = await youtubeService.getVideosForMood(mood);

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

exports.getTrendingSongs = async (req, res) => {
  try {
    const query = String(req.query.query || 'trending songs official audio').trim();
    // Request a larger set for the Trending page so the client can paginate/infinite-scroll
    const songs = await youtubeService.getVideosForMood(query, 30);

    return res.json({
      query,
      songs,
      videoIds: songs.map(s => s.videoId),
    });
  } catch (error) {
    console.error('[Trending] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
