# TheStudentMaster

### Project Description:

TheStudentMaster is a project being developed to facilitate the daily lives of students at the Cooperative State University Baden-Württemberg (DHBW). The app offers various features and services tailored specifically to the needs of students. It is being developed by a group of six students enrolled in the Cyber Security program at DHBW.

---

### Planned Features:

- **Timetable Management**: The app allows students to manage their timetables, check lecture times, and quickly capture changes.

- **Cafeteria Menu**: The app provides an overview of the cafeteria menus to help students plan their meals.

- **Cafeteria Occupancy**: Students can view the predicted occupancy of the cafeteria to choose times with less waiting.

- **Integration with Dualis**: The app connects to the Dualis platform to provide students with quick access to their grades.

- **Available Rooms**: The app allows identification of available rooms for study purposes

---

### Contributors:

- Julian Gardeike (Project Lead)
- Kasimir Weilandt
- Andreas Wolf
- Andreas Schütz
- Daniel Hecht
- Leon Sylvester

---

### Getting started

This is the quick start guide for the front end of TheStudentMaster.

#### Frontend

⚠️ Please note that you must already have `Node v21 or Node v20 (LTS)` installed on your computer in order to run the frontend application. You also need either an iOS/Android emulator or a corresponding device. Note: For a simple test of this app, we recommend that ExpoGo from the Apple App Store or Google Play Store is already installed on this device.

##### Installation and Setup

Run the following command to clone the repository:

`git clone https://gitlab.com/themastercollection/thestudentmaster.git`

Once the cloning is complete, change into the project directory:

`cd thestudentmaster`

To start the frontend go to the client folder:

`cd Client`

First install all required node packages:

`npm install`

After all packages have been successfully installed, run the following command to start the ExpoDev-Server:

`npm run start -c`

Now you can scan the QR code shown with your iOS or Android device and the app should open in Expo. With iOS you have to scan the QR code with the camera app and with Android you scan the code directly in the Expo app. For the web version, press `w` in the terminal.

⚠️ Please note that the web version will not compile on windows. This is a known issue.

#### Backend

⚠️ Please note that you must already have `Python v3.11` installed on your computer in order to run the backend application.

##### Installation and Setup

Run the following command to clone the repository:

`git clone https://gitlab.com/themastercollection/thestudentmaster.git`

Once the cloning is complete, change into the project directory:

`cd thestudentmaster`

To start the backend go to the server folder:

`cd Server`

First install all required python modules:

`pip install -r requirements.txt`

After all packages have been successfully installed, run the following command to start the backend:

`uvicorn main:app --reload` or `python uvicorn main:app --reload`

---

### Support and Feedback:

For support or feedback regarding TheStudentMaster, please contact the development team at [support@thestudentmaster.de](mailto:support@thestudentmaster.de)

---
