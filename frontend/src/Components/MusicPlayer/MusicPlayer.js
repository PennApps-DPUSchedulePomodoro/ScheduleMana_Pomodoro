import {useEffect, useState} from "react";

const SpotifyPlayer = ({ current_track, player, is_paused, setPaused }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [volume, setVolume] = useState(0.5); // Initial volume set to 50%


    useEffect(() => {
        if (player) {
            player.getVolume().then(initialVolume => {
                setVolume(initialVolume);
            });
            const updateProgress = async () => {
                const state = await player.getCurrentState();
                if (state) {
                    setCurrentTime(state.position);
                    setTotalTime(state.duration);
                }
                console.log(currentTime, totalTime);
            };

            const intervalId = setInterval(updateProgress, 1000);

            return () => clearInterval(intervalId);
        }
    }, [player])

    const formatTime = (milliseconds) => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        player.setVolume(newVolume);
    };

    return (
        <div className="spotify-player-wrapper">
            <div className="spotify-player-container">
                <img src={current_track.album.images[0].url} className="now-playing-cover" alt="Album cover"/>
                <div className="now-playing-info">
                    <div className="now-playing-details">
                        <div className="now-playing-name">{current_track.name}</div>
                        <div className="now-playing-artist">{current_track.artists[0].name}</div>
                    </div>

                    <div className="volume-control-wrapper">
                        <div className="volume-control">
                            <label htmlFor="volume">Vol: {Math.round(volume * 100)}%</label>
                            <input
                                type="range"
                                id="volume"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                            />
                        </div>
                    </div>

                    <div className="spotify-controls">
                        <button className="btn-spotify control-button" onClick={() => player.previousTrack()}>
                            <i className="fas fa-step-backward"> &lt;&lt; </i>
                        </button>
                        <button className="btn-spotify play-pause control-button" onClick={() => {
                            player.togglePlay();
                            setPaused(!is_paused);
                        }}>
                            {/*<i className={`fas fa-${is_paused ? 'play' : 'pause'}`}></i>*/}{is_paused ? "|>" : "||"}
                        </button>
                        <button className="btn-spotify control-button" onClick={() => player.nextTrack()}>
                            <i className="fas fa-step-forward"> >> </i>
                        </button>
                    </div>

                    <div className="progress-bar-wrapper">
                        <span className="current-time">{formatTime(currentTime)}</span>
                        <div className="progress-container">
                            <div className="progress">
                                <div className="progress-filled"
                                     style={{width: `${(currentTime / totalTime) * 100}%`}}></div>
                            </div>
                        </div>
                        <span className="total-time">{formatTime(totalTime)}</span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default SpotifyPlayer;