
const createTask = (taskData) => {
    const {name, description, category, priority, dueDate, status, timeSpent} = taskData;
    return {
        name,
        description,
        category,
        priority,
        dueDate,
        status,
        timeSpent,
        // Optionally, you can add methods if needed
        logTask: function() {
            console.log(`Task: ${this.name}, Priority: ${this.priority}, Status: ${this.status}`);
        },
    };
};

const TaskQueue = (taskList) => {
    const taskQueue = [];
    for (let i = 0; i < taskList.length; i++) {
        const task = createTask(taskList[i]);
        task.logTask();
        taskQueue.push(task);
    }

    const addTask = (task) => {
        taskQueue.push(task);
    };

    const removeTask = (task) => {
        const index = taskQueue.indexOf(task);
        if (index > -1) {
            taskQueue.splice(index, 1);
        }
    };

    const removeCurrentTask = () => {
        if (taskQueue.length === 0) {
            return;
        }
        taskQueue.shift();
    };

    const getCurrentTask = () => {
        if (taskQueue.length === 0) {
            return null;
        }
        return taskQueue[0];
    };

    const getTaskQueue = () => {
        return taskQueue;
    };



    return {
        addTask,
        removeTask,
        getCurrentTask,
        getTaskQueue,
        removeCurrentTask
    };
};

export default TaskQueue;
