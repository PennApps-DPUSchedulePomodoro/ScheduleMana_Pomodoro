import React, { useState, useEffect } from "react";
import taskList from "./seedData.json"; // Assuming seedData.json contains your initial task data
import TaskQueue from "./TaskQueue"; // Assuming Task is a function to create a task object
import "./TaskComponent.css";
import makeRequest from "../../utils/request";
import PomodoroTimer from "../Pomodoro/PomTimer";
const taskQueue = TaskQueue(taskList);
const taskQueue2 = makeRequest(
    {
        method: 'GET',
        url: "/calendar"
    }
)

const TaskQueueComponent = () => {
    // Initialize task queue
    console.log(taskQueue2)
    const [currentTask, setCurrentTask] = useState(taskQueue.getCurrentTask());
    const [taskQueueList, setTaskQueueList] = useState(taskQueue.getTaskQueue());

    // Function to handle task completion
    const handleFinishTask = () => {
        taskQueue.removeCurrentTask();
        setCurrentTask(taskQueue.getCurrentTask());
        setTaskQueueList([...taskQueue.getTaskQueue()]);
    };

    useEffect(() => {
        console.log("Current task updated:", currentTask);
    }, [currentTask]);

    return (
        <div className="task-layout">
            <div className="task-queue-sidebar-container">
                <div className="task-queue-sidebar">
                    <h2>Task Queue</h2>
                    <ul>
                        {taskQueueList.map((task, index) => (
                            <li key={index} className="task-item">
                                <strong>{task.name}</strong> - {task.priority}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="main-content">
                <section className="current-task-section">
                    {currentTask ? (
                        <p className="current-task-line">
                            {currentTask.name} - Priority: {currentTask.priority}
                            <button onClick={handleFinishTask} className="finish-task-button">✓</button>
                        </p>
                    ) : (
                        <p className="current-task-line">No current task</p>
                    )}
                </section>

                <section className="hero">
                    <img src="/img/resttigger.png" alt="Frog background" className="frog-bg"/>
                </section>

                <section className="timer">
                    <PomodoroTimer />
                </section>
            </div>
        </div>
    );
};

export default TaskQueueComponent;
