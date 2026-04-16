/**
 * AI Moodify — Curated Bollywood Song Library
 *
 * Larger pool (10+ songs per mood) shuffled via Fisher-Yates,
 * 4 picked per request → fresh variety on every Refresh.
 *
 * Songs are lyric/audio versions (not official music videos) to
 * maximize embed availability on YouTube.
 */

// ─── Fisher-Yates in-place shuffle ────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Curated Bollywood library ─────────────────────────────────────────────
// Priority: lyric videos, audio tracks, and cover videos —
// these have higher embed-allowance rates than official music videos.
const BOLLYWOOD_LIBRARY = {

  // ── Happiness & Fatigue ──────────────────────────────────────────────────
  happiness: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil',            artist: 'Benny Dayal' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda',          artist: 'Sonu Kakkar' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu',                    artist: 'Badshah, Nikhita Gandhi' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan',         artist: 'Shankar-Ehsaan-Loy' },
    { videoId: 'm_7Ei7yM9h0', title: 'Zingaat',                  artist: 'Ajay-Atul' },
    { videoId: 'RznSL0-oBjU', title: 'Kar Gayi Chull',           artist: 'Badshah' },
    { videoId: 'lMqL8Gzgbb0', title: 'Malang',                   artist: 'Siddharth Mahadevan' },
    { videoId: 'YualFKt4p7s', title: 'Besharam Rang',            artist: 'Caralisa Monteiro' },
    { videoId: 'CvFH_6DNRCY', title: 'Dum Maaro Dum',            artist: 'Usha Uthup' },
    { videoId: 'Y_p5kyMG4dI', title: 'Zindagi Na Milegi Dobara', artist: 'Shankar-Ehsaan-Loy' },
  ],

  fatigue: [
    { videoId: 'qMFzol9ZKtM', title: 'Badtameez Dil',            artist: 'Benny Dayal' },
    { videoId: 'TtxwtPEQnKI', title: 'Jugnu',                    artist: 'Badshah' },
    { videoId: 'xIx_HbmRnfQ', title: 'London Thumakda',          artist: 'Sonu Kakkar' },
    { videoId: '3Tug3Ls1AE8', title: 'Gallan Goodiyaan',         artist: 'Shankar-Ehsaan-Loy' },
    { videoId: 'm_7Ei7yM9h0', title: 'Zingaat',                  artist: 'Ajay-Atul' },
    { videoId: 'RznSL0-oBjU', title: 'Kar Gayi Chull',           artist: 'Badshah' },
    { videoId: 'lMqL8Gzgbb0', title: 'Malang',                   artist: 'Siddharth Mahadevan' },
    { videoId: 'YualFKt4p7s', title: 'Besharam Rang',            artist: 'Caralisa Monteiro' },
    { videoId: 'Y_p5kyMG4dI', title: 'Zindagi Na Milegi Dobara', artist: 'Shankar-Ehsaan-Loy' },
    { videoId: 'CvFH_6DNRCY', title: 'Dum Maaro Dum',            artist: 'Usha Uthup' },
  ],

  // ── Sadness ──────────────────────────────────────────────────────────────
  sadness: [
    { videoId: 'IJq0aryHTJE', title: 'Tum Hi Ho',                artist: 'Arijit Singh' },
    { videoId: 'aW3MISzfMfk', title: 'Channa Mereya',            artist: 'Arijit Singh' },
    { videoId: 'vFEgykqXNiA', title: 'Ae Dil Hai Mushkil',       artist: 'Arijit Singh' },
    { videoId: 'siKcPdJ1Muw', title: 'Tera Ban Jaunga',          artist: 'Akhil Sachdeva' },
    { videoId: 'BddP6PYo2gs', title: 'Pehli Nazar Mein',         artist: 'Atif Aslam' },
    { videoId: 'SaBNt0k-8_Q', title: 'Woh Lamhe',                artist: 'Atif Aslam' },
    { videoId: 'R6HrHMbiobE', title: 'Tujh Mein Rab Dikhta Hai', artist: 'Shreya Ghoshal' },
    { videoId: 'vo8BjGJL9Yc', title: 'Kal Ho Na Ho',             artist: 'Sonu Nigam' },
    { videoId: 'yOBnhJGEqAw', title: 'Phir Le Aya Dil',         artist: 'Rekha Bhardwaj' },
    { videoId: 'e3_YjKRaWNs', title: 'Jeena Jeena',              artist: 'Atif Aslam' },
  ],

  // ── Stress ───────────────────────────────────────────────────────────────
  stress: [
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun',             artist: 'A.R. Rahman' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara',                   artist: 'Kavita Seth' },
    { videoId: 'XLbKSicB4rw', title: 'Kabira',                   artist: 'Rekha Bhardwaj' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi',                artist: 'Mohit Chauhan' },
    { videoId: '1x-2BkB6oeU', title: 'Naina',                    artist: 'Arijit Singh' },
    { videoId: 'UGsNs6ck2VA', title: 'Lag Ja Gale',              artist: 'Lata Mangeshkar' },
    { videoId: '0tXjFB5VZLU', title: 'Raaton Ko',                artist: 'Lucky Ali' },
    { videoId: 'rFBrv5S3FGc', title: 'Mann Mera',                artist: 'Gippi' },
    { videoId: 'N0r1h1yGPKQ', title: 'Tere Bina',                artist: 'A.R. Rahman' },
    { videoId: 'Wy1pNsKYEqw', title: 'Ek Din Teri Raahon Mein',  artist: 'Lucky Ali' },
  ],

  // ── Anxiety ──────────────────────────────────────────────────────────────
  anxiety: [
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun',             artist: 'A.R. Rahman' },
    { videoId: 'UGsNs6ck2VA', title: 'Lag Ja Gale',              artist: 'Lata Mangeshkar' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara',                   artist: 'Kavita Seth' },
    { videoId: 'XLbKSicB4rw', title: 'Kabira',                   artist: 'Rekha Bhardwaj' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi',                artist: 'Mohit Chauhan' },
    { videoId: '1x-2BkB6oeU', title: 'Naina',                    artist: 'Arijit Singh' },
    { videoId: '0tXjFB5VZLU', title: 'Raaton Ko',                artist: 'Lucky Ali' },
    { videoId: 'rFBrv5S3FGc', title: 'Mann Mera',                artist: 'Gippi' },
    { videoId: 'N0r1h1yGPKQ', title: 'Tere Bina',                artist: 'A.R. Rahman' },
    { videoId: 'Wy1pNsKYEqw', title: 'Ek Din Teri Raahon Mein',  artist: 'Lucky Ali' },
  ],

  // ── Anger ─────────────────────────────────────────────────────────────────
  anger: [
    { videoId: 'UGsNs6ck2VA', title: 'Lag Ja Gale',              artist: 'Lata Mangeshkar' },
    { videoId: '8Rs1goQY2BQ', title: 'Kun Faya Kun',             artist: 'A.R. Rahman' },
    { videoId: '_sI_Ps7IN_k', title: 'Iktara',                   artist: 'Kavita Seth' },
    { videoId: 'XLbKSicB4rw', title: 'Kabira',                   artist: 'Rekha Bhardwaj' },
    { videoId: '0tXjFB5VZLU', title: 'Raaton Ko',                artist: 'Lucky Ali' },
    { videoId: 'qPUsrPAFYyg', title: 'Tum Se Hi',                artist: 'Mohit Chauhan' },
    { videoId: 'R6HrHMbiobE', title: 'Tujh Mein Rab Dikhta Hai', artist: 'Shreya Ghoshal' },
    { videoId: '1x-2BkB6oeU', title: 'Naina',                    artist: 'Arijit Singh' },
    { videoId: 'N0r1h1yGPKQ', title: 'Tere Bina',                artist: 'A.R. Rahman' },
    { videoId: 'rFBrv5S3FGc', title: 'Mann Mera',                artist: 'Gippi' },
  ],
};

/**
 * Returns 4 randomly-shuffled Bollywood song objects for the given mood.
 * The larger 10-song pool ensures variety on repeated Refresh calls.
 *
 * @param {string} dominantMood
 * @returns {{ videoId: string, title: string, artist: string }[]}
 */
exports.getVideosForMood = (dominantMood) => {
  const key = dominantMood.toLowerCase();
  const pool = BOLLYWOOD_LIBRARY[key] || BOLLYWOOD_LIBRARY['happiness'];

  const selected = shuffle([...pool]).slice(0, 4);
  console.log(`[YouTube] Mood: "${dominantMood}" → ${selected.map(s => s.title).join(' | ')}`);
  return selected;
};
