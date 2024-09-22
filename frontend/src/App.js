import PomodoroTimer from "./Components/Pomodoro/PomTimer";
import WebPlayback from "./Components/MusicPlayer/WebPlayBack";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import TaskQueueComponent from "./Components/Tasks/TaskComponent";
import MainWrapper from "./Components/MainWrapper";

function Login() {
  return (
    <div className="App">
      <header className="App-header">
        <a className="btn-spotify" href="http://localhost:8000/auth">
          Login with Google
        </a>
      </header>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={"/"} element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainWrapper />} />
      </Routes>
    </div>
  );
}

export default App;
