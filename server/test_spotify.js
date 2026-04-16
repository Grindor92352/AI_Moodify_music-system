require('dotenv').config();
const spotifyService = require('./services/spotifyService');

async function test() {
    try {
        console.log("Authenticating against Spotify with explicit ID:", process.env.SPOTIFY_CLIENT_ID ? 'Loaded' : 'Missing');
        const uris = await spotifyService.getPlaylistForMood('Joy');
        console.log(`Success! Retrieved ${uris.length} track URIs from proxy mood Joy/Happiness`);
        console.log("Sample ID:", uris[0]);
    } catch(e) {
        console.log("Integration failure:", e.message);
    }
}
test();
