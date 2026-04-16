const axios = require('axios');

/**
 * AI Moodify — Dynamic YouTube Search with Static Fallback
 * 
 * This service implements "Option A":
 * 1. Attempt a live API search with specific "lyric video/audio" queries.
 * 2. Filter for videoEmbeddable: true.
 * 3. Fall back to a local curated library if API fails (quota/network).
 */

const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// ─── Fisher-Yates in-place shuffle ────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Static Fallback Library ──────────────────────────────────────────────
const BOLLYWOOD_LIBRARY = {
  happiness: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda', artist: 'Sonu Kakkar' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu', artist: 'Badshah' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan', artist: 'Shankar-Ehsaan-Loy' },
    { videoId: 'm_7Ei7yM9h0', title: 'Zingaat', artist: 'Ajay-Atul' },
    { videoId: 'RznSL0-oBjU', title: 'Kar Gayi Chull', artist: 'Badshah' },
    { videoId: 'lMqL8Gzgbb0', title: 'Malang', artist: 'Siddharth Mahadevan' },
    { videoId: 'YualFKt4p7s', title: 'Besharam Rang', artist: 'Caralisa Monteiro' }
  ],
  fatigue: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu', artist: 'Badshah' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda', artist: 'Sonu Kakkar' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan', artist: 'Shankar-Ehsaan-Loy' }
  ],
  sadness: [
    { videoId: 'IJq0aryHTJE', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
    { videoId: 'aW3MISzfMfk', title: 'Channa Mereya', artist: 'Arijit Singh' },
    { videoId: 'vFEgykqXNiA', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh' },
    { videoId: 'siKcPdJ1Muw', title: 'Tera Ban Jaunga', artist: 'Akhil Sachdeva' }
  ],
  stress: [
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun', artist: 'A.R. Rahman' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara', artist: 'Kavita Seth' },
    { videoId: 'XLbKSicB4rw', title: 'Kabira', artist: 'Rekha Bhardwaj' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi', artist: 'Mohit Chauhan' }
  ],
  anxiety: [
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun', artist: 'A.R. Rahman' },
    { videoId: 'UGsNs6ck2VA', title: 'Lag Ja Gale', artist: 'Lata Mangeshkar' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara', artist: 'Kavita Seth' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi', artist: 'Mohit Chauhan' }
  ],
  anger: [
    { videoId: '0tXjFB5VZLU', title: 'Raaton Ko', artist: 'Lucky Ali' },
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun', artist: 'A.R. Rahman' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara', artist: 'Kavita Seth' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi', artist: 'Mohit Chauhan' }
  ]
};

const MOOD_QUERIES = {
  happiness: 'Bollywood upbeat dance official audio -shorts',
  fatigue: 'Bollywood high energy mood lifter official audio -shorts',
  sadness: 'Bollywood sad emotional Arijit Singh official audio -shorts',
  stress: 'Bollywood Lofi relax calm official audio -shorts',
  anxiety: 'Bollywood lofi meditation relax official audio -shorts',
  anger: 'Bollywood peaceful acoustic flute official audio -shorts'
};

/**
 * Returns 4 song objects for the given mood.
 * Tries YouTube Data API first, falls back to static library on error.
 */
exports.getVideosForMood = async (dominantMood) => {
  const key = dominantMood.toLowerCase();
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('[YouTube] Warning: YOUTUBE_API_KEY is missing. Using static fallback.');
    return getStaticFallback(key);
  }

  try {
    const query = MOOD_QUERIES[key] || MOOD_QUERIES['happiness'];
    
    console.log(`[YouTube API] Searching live for: "${query}"`);

    const response = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Restrict to "Music" category
        videoDuration: 'medium', // Prevent <4min Shorts and >20min Compilations
        videoEmbeddable: 'true',
        maxResults: 15,
        key: apiKey
      }
    });

    const items = response.data.items || [];
    
    if (items.length === 0) {
      console.warn('[YouTube API] No results found. Using static fallback.');
      return getStaticFallback(key);
    }

    // Map to normalized song objects
    const songs = items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle // Closest proxy for artist in search results
    }));

    // Randomize and pick 4
    return shuffle(songs).slice(0, 4);

  } catch (error) {
    console.error(`[YouTube API] Error: ${error.response?.data?.error?.message || error.message}`);
    console.log('[YouTube API] Falling back to static curated library.');
    return getStaticFallback(key);
  }
};

/**
 * Returns a shuffled slice from the static fallback library.
 */
function getStaticFallback(key) {
  const pool = BOLLYWOOD_LIBRARY[key] || BOLLYWOOD_LIBRARY['happiness'];
  return shuffle([...pool]).slice(0, 4);
}
