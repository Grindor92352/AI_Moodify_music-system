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

const PLAYLIST_LIBRARY = {
  explore: [
    { videoId: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran' },
    { videoId: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson' },
    { videoId: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5' },
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu', artist: 'Badshah' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan', artist: 'Shankar-Ehsaan-Loy' }
  ],
  bollywood: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda', artist: 'Sonu Kakkar' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan', artist: 'Shankar-Ehsaan-Loy' },
    { videoId: 'IJq0aryHTJE', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
    { videoId: 'aW3MISzfMfk', title: 'Channa Mereya', artist: 'Arijit Singh' },
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun', artist: 'A.R. Rahman' }
  ],
  hollywood: [
    { videoId: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa' },
    { videoId: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5' },
    { videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi' },
    { videoId: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran' },
    { videoId: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson' },
    { videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele' }
  ],
  lofi: [
    { videoId: 'lTRiuFIWV54', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl' },
    { videoId: 'jfKfPfyJRdk', title: 'Lofi Beats', artist: 'Lofi Girl' },
    { videoId: '5qap5aO4i9A', title: 'Iktara Lofi', artist: 'Kavita Seth' },
    { videoId: 'n61ULEU7CO0', title: 'Relaxing Lofi', artist: 'Chillhop Music' },
    { videoId: 'DWcJFNfaw9c', title: 'Late Night Lofi', artist: 'Lofi Boy' },
    { videoId: 'tfBVp0Zi2iE', title: 'Coffee Shop Radio', artist: 'STEEZYASFUCK' }
  ],
  relaxed: [
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun', artist: 'A.R. Rahman' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara', artist: 'Kavita Seth' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi', artist: 'Mohit Chauhan' },
    { videoId: 'XLbKSicB4rw', title: 'Kabira', artist: 'Rekha Bhardwaj' }
  ],
  chill: [
    { videoId: 'lTRiuFIWV54', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl' },
    { videoId: '5qap5aO4i9A', title: 'Iktara Lofi', artist: 'Kavita Seth' },
    { videoId: 'n61ULEU7CO0', title: 'Relaxing Lofi', artist: 'Chillhop Music' },
    { videoId: 'DWcJFNfaw9c', title: 'Late Night Lofi', artist: 'Lofi Boy' }
  ],
  energetic: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda', artist: 'Sonu Kakkar' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu', artist: 'Badshah' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan', artist: 'Shankar-Ehsaan-Loy' }
  ],
  nostalgic: [
    { videoId: 'IJq0aryHTJE', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
    { videoId: 'aW3MISzfMfk', title: 'Channa Mereya', artist: 'Arijit Singh' },
    { videoId: '1wYXwEcmpys', title: 'Gerua', artist: 'Arijit Singh' },
    { videoId: 'XLbKSicB4rw', title: 'Kabira', artist: 'Rekha Bhardwaj' }
  ],
  motivated: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu', artist: 'Badshah' },
    { videoId: 'm_7Ei7yM9h0', title: 'Zingaat', artist: 'Ajay-Atul' },
    { videoId: '0tXjFB5VZLU', title: 'Raaton Ko', artist: 'Lucky Ali' }
  ],
  romantic: [
    { videoId: 'IJq0aryHTJE', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
    { videoId: 'aW3MISzfMfk', title: 'Channa Mereya', artist: 'Arijit Singh' },
    { videoId: 'vFEgykqXNiA', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh' },
    { videoId: 'siKcPdJ1Muw', title: 'Tera Ban Jaunga', artist: 'Akhil Sachdeva' }
  ],
  focus: [
    { videoId: 'lTRiuFIWV54', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl' },
    { videoId: 'jfKfPfyJRdk', title: 'Lofi Beats', artist: 'Lofi Girl' },
    { videoId: '5qap5aO4i9A', title: 'Iktara Lofi', artist: 'Kavita Seth' },
    { videoId: 'tfBVp0Zi2iE', title: 'Coffee Shop Radio', artist: 'STEEZYASFUCK' }
  ],
  party: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda', artist: 'Sonu Kakkar' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu', artist: 'Badshah' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan', artist: 'Shankar-Ehsaan-Loy' }
  ]
};

const MOOD_QUERIES = {
  relaxed: 'Bollywood calm relaxing music acoustic official audio -shorts',
  chill: 'Bollywood chill lofi vibes relax music official audio -shorts',
  energetic: 'Bollywood high energy party dance upbeat music official audio -shorts',
  nostalgic: 'Bollywood nostalgic classic songs official audio -shorts',
  motivated: 'Bollywood motivational inspirational songs official audio -shorts',
  romantic: 'Bollywood romantic love ballads official audio -shorts',
  focus: 'Bollywood study focus instrumental music official audio -shorts',
  party: 'Bollywood party dance chartbusters official audio -shorts',
  happiness: 'Bollywood upbeat happy music official audio -shorts',
  sadness: 'Bollywood emotional sad songs official audio -shorts',
  stress: 'Bollywood calming meditation music official audio -shorts',
  anxiety: 'Bollywood calming meditation music official audio -shorts',
  anger: 'Bollywood peaceful acoustic flute official audio -shorts',
  fatigue: 'Bollywood high energy mood lifter official audio -shorts'
};

const PLAYLIST_QUERIES = {
  explore: 'new popular songs official audio music -shorts',
  bollywood: 'Bollywood chartbusters trending official audio -shorts',
  hollywood: 'Hollywood pop chartbusters official audio -shorts',
  lofi: 'lofi beats relax focus official audio -shorts',
  relaxed: 'Bollywood calm relaxing music official audio -shorts',
  chill: 'Bollywood chill vibes music official audio -shorts',
  energetic: 'Bollywood party hits upbeat music official audio -shorts',
  nostalgic: 'Bollywood nostalgic songs classic hits official audio -shorts',
  motivated: 'Bollywood motivational songs inspirational official audio -shorts',
  romantic: 'Bollywood romantic love songs official audio -shorts',
  focus: 'Bollywood focus study music instrumental official audio -shorts',
  party: 'Bollywood dance party hits official audio -shorts'
};

const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const MAX_CACHE_ENTRIES = 100;
const queryCache = new Map();
const lastSuccessfulMoodCache = new Map();

function _cacheKeyForMood(key, query) {
  return `${key}::${query}`;
}

function _getCachedQuery(key, query) {
  const cacheKey = _cacheKeyForMood(key, query);
  const entry = queryCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    queryCache.delete(cacheKey);
    return null;
  }
  return entry.songs;
}

function _setCachedQuery(key, query, songs) {
  const cacheKey = _cacheKeyForMood(key, query);
  queryCache.set(cacheKey, { songs, ts: Date.now() });
  if (queryCache.size > MAX_CACHE_ENTRIES) {
    const firstKey = queryCache.keys().next().value;
    queryCache.delete(firstKey);
  }
}

function _getLastSuccessfulMood(key) {
  const entry = lastSuccessfulMoodCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS * 6) {
    lastSuccessfulMoodCache.delete(key);
    return null;
  }
  return entry.songs;
}

function _setLastSuccessfulMood(key, songs) {
  lastSuccessfulMoodCache.set(key, { songs, ts: Date.now() });
}

const MOOD_CATEGORY_KEYWORDS = [
  { key: 'relaxed', keywords: ['relax', 'calm', 'soothe', 'peace', 'rest', 'unwind'] },
  { key: 'chill', keywords: ['chill', 'easy', 'mellow', 'smooth'] },
  { key: 'energetic', keywords: ['energetic', 'energized', 'upbeat', 'party', 'dance', 'alive', 'pump', 'vibe'] },
  { key: 'nostalgic', keywords: ['nostalgic', 'nostalgia', 'memories', 'remember', 'classic', 'retro'] },
  { key: 'motivated', keywords: ['motivated', 'motivate', 'inspired', 'inspire', 'drive', 'goal', 'success'] },
  { key: 'romantic', keywords: ['romantic', 'love', 'date', 'heart', 'affection', 'crush'] },
  { key: 'focus', keywords: ['focus', 'study', 'concentrate', 'work', 'productivity', 'deep work', 'brain'] },
  { key: 'party', keywords: ['party', 'celebrate', 'club', 'disco', 'tonight', 'dance floor'] },
  { key: 'stress', keywords: ['stress', 'stressed'] },
  { key: 'anxiety', keywords: ['anxiety', 'anxious', 'panic'] },
  { key: 'anger', keywords: ['angry', 'anger', 'mad'] },
  { key: 'sadness', keywords: ['sad', 'sadness', 'blue', 'down'] },
  { key: 'fatigue', keywords: ['tired', 'fatigue', 'sleepy', 'exhausted'] },
  { key: 'happiness', keywords: ['happy', 'happiness', 'joyful', 'joy'] }
];

const MOOD_KEY_MAP = {
  happiness: 'energetic',
  happy: 'energetic',
  joy: 'energetic',
  sad: 'nostalgic',
  sadness: 'nostalgic',
  stress: 'relaxed',
  anxiety: 'relaxed',
  angry: 'chill',
  anger: 'chill',
  fatigue: 'energetic',
  tired: 'energetic',
  calm: 'relaxed',
  relax: 'relaxed'
};

function getLibraryKey(input) {
  const value = String(input || '').toLowerCase();
  if (value.includes('explore')) return 'explore';
  if (value.includes('bollywood')) return 'bollywood';
  if (value.includes('hollywood')) return 'hollywood';
  if (value.includes('lofi')) return 'lofi';

  for (const { key, keywords } of MOOD_CATEGORY_KEYWORDS) {
    if (keywords.some(token => value.includes(token))) {
      return key;
    }
  }

  const tokens = value.match(/\b[a-z]+\b/g) || [];
  for (const token of tokens) {
    if (MOOD_KEY_MAP[token]) {
      return MOOD_KEY_MAP[token];
    }
  }

  return value;
}

/**
 * Returns 4 song objects for the given mood.
 * Tries YouTube Data API first, falls back to static library on error.
 */
exports.getVideosForMood = async (dominantMood) => {
  const key = getLibraryKey(dominantMood);
  const apiKey = process.env.YOUTUBE_API_KEY;
  const query = PLAYLIST_QUERIES[key] || MOOD_QUERIES[key] || `${dominantMood} song official audio -shorts`;

  const cached = _getCachedQuery(key, query);
  if (cached) {
    console.log(`[YouTube API] Returning cached query result for '${query}'`);
    return cached;
  }

  const lastSuccessful = _getLastSuccessfulMood(key);
  if (!apiKey && lastSuccessful) {
    console.warn('[YouTube] No API key. Returning last successful playlist for mood.');
    return lastSuccessful;
  }

  if (!apiKey) {
    console.warn('[YouTube] Warning: YOUTUBE_API_KEY is missing. Using static fallback.');
    return getStaticFallback(key);
  }

  try {
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
      console.warn('[YouTube API] No results found. Falling back to last successful playlist or static curated library.');
      return lastSuccessful || getStaticFallback(key);
    }

    const songs = shuffle(items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle
    }))).slice(0, 4);

    _setCachedQuery(key, query, songs);
    _setLastSuccessfulMood(key, songs);
    return songs;
  } catch (error) {
    console.error(`[YouTube API] Error: ${error.response?.data?.error?.message || error.message}`);
    console.log('[YouTube API] Falling back to last successful playlist or static curated library.');
    return lastSuccessful || getStaticFallback(key);
  }
};

/**
 * Returns a shuffled slice from the static fallback library.
 */
function getStaticFallback(key) {
  const pool = PLAYLIST_LIBRARY[key] || BOLLYWOOD_LIBRARY[key] || BOLLYWOOD_LIBRARY['happiness'];
  return shuffle([...pool]).slice(0, 4);
}
