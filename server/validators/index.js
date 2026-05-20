const { validate, MAX_DESC_LEN } = require('../middleware/validate');

const authSignup = validate({
  email: { type: 'email', required: true },
  password: { type: 'password', required: true, minLength: 6, maxLength: 128 },
  name: { type: 'string', maxLength: 255 },
  age: { type: 'integer', min: 1, max: 120 },
  preferredSingers: { type: 'stringArray', maxItems: 20, maxItemLength: 100 }
});

const authLogin = validate({
  email: { type: 'email', required: true },
  password: { type: 'password', required: true, maxLength: 128 }
});

const musicAnalyze = validate({
  image: { type: 'base64Image', required: true, message: 'Empty or invalid image payload' }
});

const musicRefresh = validate({
  mood: { type: 'mood', required: true, message: 'mood is required for refresh' }
});

const historySave = validate({
  mood: { type: 'mood', required: true },
  songs: { type: 'songArray' }
});

const playlistCreate = validate({
  name: { type: 'string', required: true, maxLength: 255, message: 'Playlist name is required' },
  description: { type: 'string', maxLength: MAX_DESC_LEN }
});

const playlistUpdate = validate({
  name: { type: 'string', required: true, maxLength: 255, message: 'Playlist name is required' },
  description: { type: 'string', maxLength: MAX_DESC_LEN }
});

const playlistIdParam = validate({
  playlistId: { type: 'id', required: true, source: 'params' }
});

const playlistSongParams = validate({
  playlistId: { type: 'id', required: true, source: 'params' },
  songId: { type: 'id', required: true, source: 'params' }
});

const addSongToPlaylist = validate({
  playlistId: { type: 'id', required: true, source: 'params' },
  videoId: { type: 'youtubeId', required: true },
  title: { type: 'string', required: true, maxLength: 500, message: 'title is required' },
  artist: { type: 'string', required: true, maxLength: 500, message: 'artist is required' }
});

module.exports = {
  authSignup,
  authLogin,
  musicAnalyze,
  musicRefresh,
  historySave,
  playlistCreate,
  playlistUpdate,
  playlistIdParam,
  playlistSongParams,
  addSongToPlaylist
};
