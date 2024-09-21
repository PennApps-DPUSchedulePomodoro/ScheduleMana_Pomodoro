import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faPauseCircle, faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import './PomTimer.css';

const PomodoroTimer = () => {
    const [workTime, setWorkTime] = useState(25); // Default 25
    const [breakTime, setBreakTime] = useState(5); // Default 5

    const [isRunning, setIsRunning] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true); //

    const [timeLeft, setTimeLeft] = useState(workTime * 60);
    const intervalRef = useRef(null);

    // Update the timer when workTime or breakTime changes
    useEffect(() => {
        setTimeLeft(isWorkSession ? workTime * 60 : breakTime * 60);
    }, [workTime, breakTime, isWorkSession]);

    // Format time in mm:ss
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Start the timer
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTimeLeft) => {
                    if (prevTimeLeft === 0) {
                        changeSession();
                        return isWorkSession ? breakTime * 60 : workTime * 60;
                    }
                    return prevTimeLeft - 1;
                });
            }, 1000);
        }
    };

    // Pause the timer
    const pauseTimer = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // Reset the timer
    const resetTimer = () => {
        pauseTimer();
        setTimeLeft(isWorkSession ? workTime * 60 : breakTime * 60);
    };

    // Toggle between work and break sessions
    const changeSession = () => {
        setIsWorkSession((prevSession) => !prevSession);
    };

    // Handle time input changes
    const handleWorkTimeChange = (e) => {
        setWorkTime(e.target.value);
    };

    const handleBreakTimeChange = (e) => {
        setBreakTime(e.target.value);
    };

    return (
        <div className="pomodoro-timer">
            <div className="time-display">
                <h1>{formatTime(timeLeft)}</h1>
            </div>

            <div className="controls">
                {!isRunning ? (
                    <button onClick={startTimer} className="action-btn">
                        <FontAwesomeIcon icon={faPlayCircle} size="2x"/>
                    </button>
                ) : (
                    <button onClick={pauseTimer} className="action-btn">
                        <FontAwesomeIcon icon={faPauseCircle} size="2x"/>
                    </button>
                )}
                <button onClick={resetTimer} className="action-btn">
                    <FontAwesomeIcon icon={faRedoAlt} size="2x"/>
                </button>
            </div>

            <div className="time-inputs">
                <label>
                    Work:
                    <input
                        type="number"
                        min="1"
                        value={workTime}
                        onChange={handleWorkTimeChange}
                        disabled={isRunning}
                    />{" "}
                    min
                </label>
                <label>
                    Break:
                    <input
                        type="number"
                        min="1"
                        value={breakTime}
                        onChange={handleBreakTimeChange}
                        disabled={isRunning}
                    />{" "}
                    min
                </label>
            </div>
        </div>


    );
};

export default PomodoroTimer;
