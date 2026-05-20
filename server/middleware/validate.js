const MAX_MOOD_LEN = 100;
const MAX_NAME_LEN = 255;
const MAX_DESC_LEN = 2000;
const MAX_SONG_TITLE = 500;
const MAX_SONG_ARTIST = 500;
const MAX_VIDEO_ID_LEN = 64;
const MAX_SONGS_PER_HISTORY = 50;

function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail(email) {
  return trimString(email).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function parseSongArray(raw, fieldName, errors) {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    errors.push({ field: fieldName, message: 'Must be an array of songs' });
    return [];
  }
  if (raw.length > MAX_SONGS_PER_HISTORY) {
    errors.push({ field: fieldName, message: `Cannot exceed ${MAX_SONGS_PER_HISTORY} tracks` });
    return [];
  }

  const songs = [];
  raw.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push({ field: `${fieldName}[${index}]`, message: 'Invalid song object' });
      return;
    }
    const videoId = trimString(item.videoId);
    const title = trimString(item.title);
    const artist = trimString(item.artist);
    if (!videoId || !title || !artist) {
      errors.push({ field: `${fieldName}[${index}]`, message: 'videoId, title, and artist are required' });
      return;
    }
    if (videoId.length > MAX_VIDEO_ID_LEN || title.length > MAX_SONG_TITLE || artist.length > MAX_SONG_ARTIST) {
      errors.push({ field: `${fieldName}[${index}]`, message: 'Song fields exceed max length' });
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
      errors.push({ field: `${fieldName}[${index}].videoId`, message: 'Invalid video id format' });
      return;
    }
    songs.push({ videoId, title, artist });
  });
  return songs;
}

function parseStringArray(raw, fieldName, maxItems, maxItemLen, errors) {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    errors.push({ field: fieldName, message: 'Must be an array of strings' });
    return [];
  }
  if (raw.length > maxItems) {
    errors.push({ field: fieldName, message: `Cannot exceed ${maxItems} items` });
    return [];
  }
  return raw
    .map((item, i) => {
      if (typeof item !== 'string') {
        errors.push({ field: `${fieldName}[${i}]`, message: 'Must be a string' });
        return null;
      }
      const v = item.trim();
      if (!v) return null;
      if (v.length > maxItemLen) {
        errors.push({ field: `${fieldName}[${i}]`, message: `Max ${maxItemLen} characters` });
        return null;
      }
      return v;
    })
    .filter(Boolean);
}

/**
 * Central request validation. Attaches sanitized values to req.validated.
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const validated = {};

    for (const [field, rules] of Object.entries(schema)) {
      const source = rules.source === 'params' ? req.params
        : rules.source === 'query' ? req.query
          : req.body;
      const raw = source[field];

      if (rules.required) {
        const missing = raw === undefined || raw === null
          || (typeof raw === 'string' && !raw.trim());
        if (missing) {
          errors.push({ field, message: rules.message || `${field} is required` });
          continue;
        }
      }

      if (raw === undefined || raw === null) continue;

      switch (rules.type) {
        case 'email': {
          const email = normalizeEmail(raw);
          if (!isValidEmail(email)) {
            errors.push({ field, message: 'Enter a valid email address' });
          } else {
            validated[field] = email;
          }
          break;
        }
        case 'password': {
          const pwd = String(raw);
          if (pwd.length < (rules.minLength || 6)) {
            errors.push({ field, message: `Password must be at least ${rules.minLength || 6} characters` });
          } else if (pwd.length > (rules.maxLength || 128)) {
            errors.push({ field, message: 'Password is too long' });
          } else {
            validated[field] = pwd;
          }
          break;
        }
        case 'string': {
          const str = trimString(String(raw));
          if (!str && rules.required) {
            errors.push({ field, message: rules.message || `${field} is required` });
          } else if (str.length > (rules.maxLength || MAX_NAME_LEN)) {
            errors.push({ field, message: `${field} is too long` });
          } else {
            validated[field] = str;
          }
          break;
        }
        case 'mood': {
          const mood = trimString(String(raw));
          if (!mood) {
            errors.push({ field, message: 'Mood is required' });
          } else if (mood.length > MAX_MOOD_LEN) {
            errors.push({ field, message: 'Mood is too long' });
          } else {
            validated[field] = mood;
          }
          break;
        }
        case 'integer': {
          const num = Number(raw);
          if (!Number.isInteger(num) || num < (rules.min ?? 0) || num > (rules.max ?? 999)) {
            errors.push({ field, message: rules.message || `Invalid ${field}` });
          } else {
            validated[field] = num;
          }
          break;
        }
        case 'id': {
          const id = trimString(String(raw));
          if (!/^\d+$/.test(id)) {
            errors.push({ field, message: 'Invalid id' });
          } else {
            validated[field] = id;
          }
          break;
        }
        case 'youtubeId': {
          const videoId = trimString(String(raw));
          if (!videoId || videoId.length > MAX_VIDEO_ID_LEN || !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
            errors.push({ field, message: 'Invalid video id' });
          } else {
            validated[field] = videoId;
          }
          break;
        }
        case 'base64Image': {
          const img = trimString(String(raw));
          if (!img.startsWith('data:image/') && img.length < 32) {
            errors.push({ field, message: 'Empty or invalid image payload' });
          } else if (img.length > 12_000_000) {
            errors.push({ field, message: 'Image payload too large' });
          } else {
            validated[field] = img;
          }
          break;
        }
        case 'songArray':
          validated[field] = parseSongArray(raw, field, errors);
          break;
        case 'stringArray':
          validated[field] = parseStringArray(raw, field, rules.maxItems || 20, rules.maxItemLength || 100, errors);
          break;
        default:
          validated[field] = raw;
      }
    }

    if (errors.length > 0) {
      const message = errors.length === 1 ? errors[0].message : 'Validation failed';
      return res.status(400).json({ error: message, details: errors });
    }

    req.validated = { ...req.validated, ...validated };
    return next();
  };
}

module.exports = {
  validate,
  normalizeEmail,
  isValidEmail,
  MAX_DESC_LEN
};
