const axios = require('axios');

// Moods that can be used as fallbacks when AI pipeline is unavailable
const FALLBACK_MOODS = ['Happiness', 'Sadness', 'Stress', 'Anger', 'Anxiety', 'Fatigue'];

/**
 * Attempts to detect mood via the Python AI pipeline HTTP endpoint.
 * If the pipeline is unavailable (timeout, connection refused, error),
 * gracefully resolves with a random fallback mood so the app keeps functioning.
 *
 * @param {string} base64Image - Raw base64 image string
 * @returns {Promise<string>} - Detected or fallback mood label
 */
exports.getMoodFromImage = async (base64Image) => {
  try {
    const aiPipelineUrl = process.env.AI_PIPELINE_URL || 'http://localhost:8000';
    const response = await axios.post(`${aiPipelineUrl}/analyze-frame`, {
      image_base64: base64Image
    }, { timeout: 10000 });

    const data = response.data;

    if (data.dominant_mood) {
      console.log(`[MoodService] Detected mood: ${data.dominant_mood}`);
      return data.dominant_mood;
    } else if (data.error) {
      console.warn(`[MoodService] Pipeline soft error: "${data.error}" — using fallback mood.`);
      return _randomFallback();
    } else {
      console.warn('[MoodService] Unexpected schema — using fallback mood.');
      return _randomFallback();
    }
  } catch (error) {
    console.warn(`[MoodService] Pipeline connection error (${error.message}) — using fallback mood.`);
    return _randomFallback();
  }
};

function _randomFallback() {
  const mood = FALLBACK_MOODS[Math.floor(Math.random() * FALLBACK_MOODS.length)];
  console.log(`[MoodService] Fallback mood selected: ${mood}`);
  return mood;
}
