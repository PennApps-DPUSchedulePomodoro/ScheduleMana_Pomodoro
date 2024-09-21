import React, { useState, useEffect } from 'react';
import './Header.css';
const Header = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();
            setTime(`${hours}:${minutes}`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="taskbar">
            <div className="taskbar-left">
                <button className="task-btn">Tasks</button>
            </div>
            <div className="taskbar-center">
                <h1 className="branding">Tigger</h1>
            </div>
            <div className="taskbar-right">
                <img
                    src="/img/unknown_profile_icon.png"
                    className="profile-icon"
                    alt="Profile"
                />
                <img
                    src="/img/Calendar-icon.png"
                    className="calendar-icon"
                    alt="Calendar"
                />
                <nav>
                    <h1 className="time">{time}</h1>
                </nav>
            </div>
        </header>

    );
}

export default Header;
