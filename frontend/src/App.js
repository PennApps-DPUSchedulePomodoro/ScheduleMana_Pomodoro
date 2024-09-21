import PomodoroTimer from "./Components/Pomodoro/PomTimer";
import WebPlayback from "./Components/MusicPlayer/WebPlayBack";
import {Route, Routes, Navigate, useNavigate,} from 'react-router-dom';
import TaskQueueComponent from "./Components/Tasks/TaskComponent";


function Login() {
    return (
        <div className="App">
            <header className="App-header">
                <a className="btn-spotify" href="/auth/login" >
                    Login with Spotify
                </a>
            </header>
        </div>
    );
}

function App() {
  return (
    <div className="App">
                    <h1>Schedule Pomodoro</h1>
                    <PomodoroTimer/>
                    {/*<WebPlayback/>*/}
                    <TaskQueueComponent />
    </div>
);
}

export default App;
