//request to play a track


import {storeTokenHandler, getTokenHandler} from "../../../utils/tokenHandling";
import makeRequest from "../../../utils/request"

async function reqPlayTrackWithId(accessToken, deviceId, requestTrack, trackUris){
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                    uris: trackUris.map(trackUri => 'spotify:track:' + trackUri),
                    offset: {
                        uri: 'spotify:track:' + requestTrack
                    }
                })
    }).catch(error => console.error('Error playing track:', error));
}

async function reqPlayPlaylistWithId(accessToken, deviceId, playlistUri) {
    // const accessToken = getTokenHandler("accessToken");
    // const deviceId = localStorage.getItem("deviceId");
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            context_uri: `spotify:playlist:${playlistUri}`,
        }),
    }).catch(error => console.error('Error playing playlist:', error));
}

export {reqPlayTrackWithId, reqPlayPlaylistWithId};
