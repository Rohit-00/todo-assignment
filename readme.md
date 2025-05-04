
# To-Do App

A cross-platform To-Do List app built using React Native with Expo, designed for Android and iOS. This app lets users manage their daily tasks efficiently and sends notification for tasks deadlines.


## Features

- Create, update, and delete tasks
- Create, update, and delete tasks

- Schedule tasks with due dates and receive notifications

- Works on both Android and iOS

- Clean and intuitive UI using React Native components

- Persistent storage using AsyncStorage or SQLite

- Built using Expo for quick development and testing


## Screenshots

![App Homescreen](https://i.ibb.co/ksnLbtnc/Screenshot-2025-05-04-13-31-42-49-744aaa3b62505820a805dca00bd469a9-1.jpg)

![Adding Task](https://i.ibb.co/SDJkXjp7/68747470733a2f2f692e6962622e636f2f684a786d563835762f53637265656e73686f742d323032352d30352d30342d3133.jpg)

![Notification](https://i.ibb.co/fV2LZWht/Screenshot-2025-05-04-13-33-11-47-744aaa3b62505820a805dca00bd469a9-1.jpg)


## Tech Stack

- React Native

- Expo SDK

- Firebase

- Expo Notifications

- AsyncStorage or SQLite (for persistent data)

- React Navigation (for navigating between screens)




## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```bash
API_KEY=your_api_key
AUTH_DOMAIN=your_project.firebaseapp.com
PROJECT_ID=your_project_id
STORAGE_BUCKET=your_project.appspot.com
MESSAGING_SENDER_ID=your_messaging_sender_id
APP_ID=your_app_id
MEASUREMENT_ID=your_measurement_id
```


## Installation

Clone the repository

```bash
  git clone https://github.com/Rohit-00/todo-assignment.git
  cd todo-assignment
```

Install the dependencies

```bash
  npm install
``` 

Start the app

```bash
  npx expo start
```