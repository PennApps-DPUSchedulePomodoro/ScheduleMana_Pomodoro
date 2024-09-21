import React, { useState, useEffect } from "react";
import taskList from "./seedData.json"; // Assuming seedData.json contains your initial task data
import TaskQueue from "./TaskQueue"; // Assuming Task is a function to create a task object
import "./TaskComponent.css";
const taskQueue = TaskQueue(taskList);
const TaskQueueComponent = () => {
    // Initialize task queue
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

            <div className="main-content">
                <section className="current-task-section">
                    <h2>Current Task</h2>
                    {currentTask ? (
                        <div className="current-task-details">
                            <p><strong>Name:</strong> {currentTask.name}</p>
                            <p><strong>Description:</strong> {currentTask.description}</p>
                            <p><strong>Priority:</strong> {currentTask.priority}</p>
                            <button onClick={handleFinishTask} className="finish-task-button">Finish Task</button>
                        </div>
                    ) : (
                        <p>No current task</p>
                    )}
                </section>

                <section className="hero">
                    <div>
                        <img src="/img/resttigger.png" className="tiger-img" alt="Tiger" />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TaskQueueComponent;
