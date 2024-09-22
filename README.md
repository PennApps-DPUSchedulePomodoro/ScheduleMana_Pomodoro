# **SmartScedule**

SmartScedule is a time management and productivity tool that integrates the Pomodoro Technique with a scheduling system, resolved by LLM. It helps users manage their tasks effectively by breaking them into short intervals with scheduled breaks.

## **Table of Contents**
Description   
Features    
Installation    
Usage    
Contributing    
Credits   
License   

### **Description**

The **SmartScedule** website provides a simple interface for users to organize their tasks, manage time, and enhance productivity using the Pomodoro Technique. This app is especially useful for students and professionals who want to stay focused and maximize their workflow. It was built as part of the PennApps hackathon to demonstrate effective time management.

How it works:
The app gonna retrieve your calendar from the Google Calendar API, and parse it into cerebras API LLM to generate the most optimized schedule throughout the day base on prompt engineering and sorting algorithms. It guarantee you the most productivity as well as the most events you can attend. After each week, month, a custom report will be generated using a model based on BERT to display your scheduling metrics of the given time range.

**Motivation:** The idea was to build a user-friendly tool to help people combine the benefits of the Pomodoro Technique with detailed task scheduling to boost productivity.

**Technologies Used:**

React for frontend  
MongoDB for data storage   
Express.js for API handling    

### **Features**

Task scheduling and tracking   
Integrated Pomodoro timer     
Customizable work/break intervals    
Task completion tracking    
Productivity statistics and history    

### **Installation**
To run this project locally:

1. Clone the repository:
```
git clone https://github.com/PennApps-DPUSchedulePomodoro/ScheduleMana_Pomodoro
```
2. Navigate into the project directory:
```
cd ScheduleMana_Pomodoro
```
3. Install the dependencies:
```
npm install
```
4. Start the application:
```
npm start
```

## **Usage**
To use **SmartScedule**, follow these steps:

Add tasks to the task list by entering their details.
Start a Pomodoro timer for a selected task.
Work during the timed intervals, with breaks in between.
Track task completion and check your productivity in the statistics section.
Screenshots of the app in use:


**Contributing**
Contributions are welcome! Follow these steps to contribute:

1. Fork the repository.
2. Create a new feature branch:
   ```
   git checkout -b feature-branch
   ```
3. Commit your changes:
   ```
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```
   git push origin feature-branch
   ```
5. Open a pull request.

## **Credits**
* Mian Abdullah
* Tom Nguyen
* Minh Nguyen


**SmartScedule** - PennApps Team - Hackathon participants and contributors      
Special thanks to the PennApps community and organizers.
