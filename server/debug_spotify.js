require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');

async function test() {
    const s = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    });

    try {
        console.log("Authenticating...");
        const authData = await s.clientCredentialsGrant();
        console.log("Token Acquired.");
        s.setAccessToken(authData.body['access_token']);

        console.log("Pinging getRecommendations...");
        const recs = await s.getRecommendations({ seed_genres: ['pop'], limit: 1 });
        console.log("Recs Ok!", recs.body);
    } catch (e) {
        console.log("RECOMMENDATIONS ERROR:", e.statusCode);
        console.log(e.body);
        
        console.log("\nPinging searchTracks...");
        try {
            const search = await s.searchTracks("genre:pop", { limit: 1 });
            console.log("Search Ok!", search.body);
        } catch (e2) {
            console.log("SEARCH ERROR:", e2.statusCode);
            console.log(e2.body);
        }
    }
}
test();
