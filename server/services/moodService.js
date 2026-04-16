const WebSocket = require('ws');

// Moods that can be used as fallbacks when AI pipeline is unavailable
const FALLBACK_MOODS = ['Happiness', 'Sadness', 'Stress', 'Anger', 'Anxiety', 'Fatigue'];

/**
 * Attempts to detect mood via the Python AI pipeline WebSocket.
 * If the pipeline is unavailable (timeout, connection refused, Hume API error),
 * gracefully resolves with a random fallback mood so the app keeps functioning.
 *
 * @param {string} base64Image - Raw base64 image string
 * @returns {Promise<string>} - Detected or fallback mood label
 */
exports.getMoodFromImage = (base64Image) => {
  return new Promise((resolve) => {

    // Attempt to connect to the Python pipeline
    let ws;
    try {
      ws = new WebSocket('ws://localhost:8000/ws/analyze-frame');
    } catch (initErr) {
      console.warn('[MoodService] WebSocket init failed — using fallback mood.');
      return resolve(_randomFallback());
    }

    // 10-second hard timeout — resolve with fallback instead of rejecting
    const timeout = setTimeout(() => {
      console.warn('[MoodService] Python pipeline timed out — using fallback mood.');
      try { ws.terminate(); } catch (_) {}
      resolve(_randomFallback());
    }, 10000);

    ws.on('open', () => {
      ws.send(base64Image);
    });

    ws.on('message', (data) => {
      clearTimeout(timeout);
      try {
        const response = JSON.parse(data);

        if (response.dominant_mood) {
          // SUCCESS: AI pipeline returned a real detection
          console.log(`[MoodService] Detected mood: ${response.dominant_mood} (confidence: ${response.confidence?.toFixed(3) ?? 'N/A'})`);
          resolve(response.dominant_mood);
        } else if (response.error) {
          // Pipeline error (e.g. "No face detected") — treat as soft failure
          console.warn(`[MoodService] Pipeline soft error: "${response.error}" — using fallback mood.`);
          resolve(_randomFallback());
        } else {
          console.warn('[MoodService] Unexpected schema — using fallback mood.');
          resolve(_randomFallback());
        }
      } catch (parseErr) {
        console.warn('[MoodService] Failed to parse pipeline response — using fallback mood.');
        resolve(_randomFallback());
      } finally {
        try { ws.close(); } catch (_) {}
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      console.warn(`[MoodService] Pipeline connection error (${err.message}) — using fallback mood.`);
      resolve(_randomFallback());
    });
  });
};

function _randomFallback() {
  const mood = FALLBACK_MOODS[Math.floor(Math.random() * FALLBACK_MOODS.length)];
  console.log(`[MoodService] Fallback mood selected: ${mood}`);
  return mood;
}
