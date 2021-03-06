import axios from 'axios';
import log from '../modules/log';
export default {
    user: async () => {
        let res;
        try {
            res = await axios.get('https://api.spotify.com/v1/me', getConfig());
        } catch (error) {
            console.log(error)
            if(error.response.status === 401) refreshToken();
        }
        return (res || {}).data;
    },
    play: async (device, track, position, usepreview) => {
        const data = {
            "uris": [`spotify:track:${track.id}`],
            "position_ms": position || 0
          }
        let preview
        try {
            if(!usepreview) await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${device}`, data, getConfig());
            else {
                preview = new Audio(track.preview_url);
                preview.play();
            }
        } catch (error) {
            console.log(error)
            if(error.response.status === 401) refreshToken();
        }
        return preview;
    },
    recommendations: async (seed, market, genre, popularity) => {
        let res;
        log("popularity: ", popularity);
        try {
            res = await axios.get(`https://api.spotify.com/v1/recommendations?limit=25&market=${market}${seed ? `&seed_tracks=${seed}` : ''}${(genre ? `&seed_genres=${genre}` : '')}&min_popularity=${popularity || 50}`, getConfig());
        } catch (error) {
            console.log(error)
            if(error.response.status === 401) refreshToken();
        }
        return (res || {}).data;
    },
    tracks: async (g) => {
        let res;
        let range = ['long_term', 'medium_term' , 'short_term'];
        let r = range[Math.floor(Math.random() * 3)];
        try {
            log(r);
            if(!g) res = await axios.get(`https://api.spotify.com/v1/me/top/tracks?time_range=${r}&limit=50`, getConfig());
            if(g || !res.data.items[0]) res = await axios.get(`https://api.spotify.com/v1/recommendations?limit=50&seed_genres=${g || 'pop'}&min_popularity=10`, getConfig());
        } catch (error) {
            console.log(error)
            if(error.response.status === 401) refreshToken();
        }
        return (res || {}).data;
    },
    genres: async () => {
        let res;
        try {
            res = await axios.get(`https://api.spotify.com/v1/recommendations/available-genre-seeds`, getConfig());
        } catch (error) {
            console.log(error)
            if(error.response.status === 401) refreshToken();
        }
        return (res || {}).data;
    },
    refreshToken: refreshToken
}

function getConfig() {
    return {
        headers: {
            Authorization: `Bearer ${localStorage.access_token}`,
        }
    };
}

async function refreshToken() {
    let res;
    try {
        res = await axios.get(`/api/refresh_token?refresh_token=${localStorage.refresh_token}`);
        window.localStorage.access_token = res.data.access_token;
        console.log('token_refreshed');
    }
    catch (error) {
        console.log(error);
        delete window.localStorage.access_token;
    }
    return res.access_token;
}
