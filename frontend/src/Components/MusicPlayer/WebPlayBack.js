import React, { useState, useEffect } from 'react';
import switchDevice from "./Services/device";
import SpotifyPlayer from "./MusicPlayer";

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

export function getTokenHandler(type){
    return sessionStorage.getItem(type)
}

function WebPlayback() {
        const [is_paused, setPaused] = useState(false);
        const [is_active, setActive] = useState(false);
        const [player, setPlayer] = useState(undefined);
        const [current_track, setTrack] = useState(track);
        var deviceName = 'Huy Music Web'

        //Consider revise this ...
        const [token, setToken] = useState(getTokenHandler('accessToken'))


    const handleSwitchDevice = async () => {
        try {
            await switchDevice(token, deviceName);
            setActive(true); // Update active state after switching device
        } catch (error) {
            console.error('Error switching device:', error);
        }
    };
    //Only use to first render the page
    useEffect(() => {
        // Load Spotify Web Playback SDK script
        const loadSpotifySDK = () => {
            return new Promise((resolve) => {
                const existingScript = document.getElementById('spotify-sdk');
                if (!existingScript) {
                    const script = document.createElement('script');
                    script.id = 'spotify-sdk';
                    script.src = 'https://sdk.scdn.co/spotify-player.js';
                    script.async = true;
                    script.onload = resolve;
                    document.body.appendChild(script);
                } else {
                    resolve();
                }
            });
        };

        const initSpotifyPlayer = async () => {
            await loadSpotifySDK();

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new window.Spotify.Player({
                    name: deviceName,
                    getOAuthToken: cb => {
                        cb(token);
                    },
                    volume: 0.5
                });
                setPlayer(player);

                //Add listener to player
                player.addListener('initialization_error', ({message}) => {
                    console.error('Failed to initialize', message);
                });

                player.addListener('authentication_error', ({message}) => {
                    console.error('Failed to authenticate', message);
                });

                player.addListener('account_error', ({message}) => {
                    console.error('Failed to validate Spotify account', message);
                });

                player.addListener('playback_error', ({message}) => {
                    console.error('Failed to perform playback', message);
                });

                player.addListener('ready', ({device_id}) => {
                    console.log('Ready with Device ID', device_id);
                });

                player.addListener('not_ready', ({device_id}) => {
                    console.log('Device ID has gone offline', device_id);
                });

                player.addListener('player_state_changed', (state) => {
                    if (state) {
                        setTrack(state.track_window.current_track);
                        setPaused(state.paused);
                    }
                });

                // Connect to the player!
                player.connect().then(success => {
                    if (success) {
                        console.log('Successfully connected to Spotify player');
                        setTimeout(() => {
                            switchDevice(token, deviceName).then(() => {
                                console.log('Device switched successfully');
                                setActive(true);
                            }).catch(error => {
                                console.error('Error switching device:', error);
                            });
                        }, 3000);
                    } else {
                        console.error('Unable to connect to Spotify Player');
                        window.location.reload();
                    }
                });
            }
        }
        initSpotifyPlayer();

        //Change Token
        const intervalId = setInterval(async () => {
            await setToken(getTokenHandler('accessToken'));
        }, 900000); // Refresh token every 15 minutes (900000 milliseconds)


        return () => {
            if (player) {
                player.disconnect();
            }
            clearInterval(intervalId);
        }
    }, [token, deviceName, switchDevice]);



    // Effect to update player's token when it changes
    useEffect(() => {
        if (player) {
            player._options.getOAuthToken = cb => { cb(token); };
        }
    }, [token, player]);


    if (!is_active) {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        {/*<b> ...Waiting to transfer device... </b>*/}
                        <button
                            onClick={handleSwitchDevice}
                        >Manual Switch device</button>
                    </div>
                </div>
            </>)
    } else {
        return (
            <SpotifyPlayer player={player} current_track={current_track} is_paused={is_paused} setPaused={setPaused} />
        );
    }
}

export default WebPlayback