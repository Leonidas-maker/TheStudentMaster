# 🎓 TheStudentMaster

## 📖 Project Description

TheStudentMaster is a project developed to facilitate the daily lives of students at the **Cooperative State University Baden-Württemberg (DHBW)**. The app offers various features and services tailored specifically to student needs. It is being developed by a group of six students enrolled in the Cyber Security program at DHBW.

---

## 📲 Download TheStudentMaster

TheStudentMaster is available on both iOS and Android platforms. Download the app using the following links:

- [Download on iOS](https://thestudentmaster.de/get/ios)
- [Download on Android](https://thestudentmaster.de/get/android)

---

## 📋 Features

- **🗓️ Timetable Management**: Manage your timetables, check lecture times, and quickly capture changes.
- **🍽️ Cafeteria Menu**: Get an overview of cafeteria menus to help plan your meals.
- **📊 Integration with Dualis**: Connect to the Dualis platform for quick access to your grades.
- **🏫 Available Rooms**: Identify available rooms for study purposes.

---

## 🌟 Planned Features

- **🚦 Cafeteria Occupancy**: View predicted occupancy of the cafeteria to choose times with less waiting.
- **🧮 Grade Calculator** : Enter the maximum possible points and your estimated points for an exam — the calculator converts them into your final grade.
- **📊 Average Grade Calculator**: Calculate your semester GPA or overall average grade based on all entered marks.
- **📧 Zimbra Integration**: Sync your Zimbra mailbox to receive university emails and notifications directly in the app.
- **📂 Dualis Document Downloads**: Download your enrollment certificates and grade transcripts from Dualis with a single click.
- **🎒 Moodle Integration**: Access your Moodle courses, submissions, grades, and materials without leaving the app.
- **🗺️ Interactive Room Map**: Explore the campus on an interactive map to locate lecture halls, study rooms, and other facilities.
- **🚆 Train & Tram Timetable**: View real-time departures and get step-by-step directions to campus.
- **📰 Newsroom**: Stay up to date with app updates, announcements, and all DHBW-related news.

---

## 👥 Contributors

- **Andreas Schütz** _(Backend Lead)_
- **Leon Sylvester** _(Frontend Lead)_
- **Andreas Wolf** _(Backend, CI/CD)_

---

- **Julian Gardeike** _(inactive)_
- **Daniel Hecht** _(inactive)_
- **Kasimir Weilandt** _(inactive)_

---

## 🚀 Getting Started

This is the quick start guide for the front end of **TheStudentMaster**.

### 📱 Frontend

⚠️ **Please note**: You must have **Node v20 (LTS)** or **Node v21** installed on your computer to run the frontend application. You also need either an iOS/Android emulator or a corresponding device. For a simple test of this app, we recommend installing **Expo Go** from the Apple App Store or Google Play Store on your device.

#### Installation and Setup

1. **Clone the repository**:

   ```bash
   git clone https://gitlab.com/themastercollection/thestudentmaster.git
   ```

2. **Go to the client folder**:

   ```bash
   cd ./thestudentmaster/Client
   ```

3. **Install all required node packages**:

   ```bash
   npm install
   ```

4. **Start the Expo Dev Server**:

   ```bash
   npm run start -c
   ```

5. **Run the App**:

   - Scan the QR code displayed with your iOS or Android device.
     - iOS: Scan the QR code with the Camera app.
     - Android: Scan the code directly in the Expo Go app.
   - For the web version, press w in the terminal.

   ⚠️ Note: The web version will not compile on Windows. This is a known issue.

### 🖥️ Backend

⚠️ **Please note**: You must have **Python >= v3.11** installed on your computer to run the backend application.

#### Installation and Setup

1. Clone the repository:

   ```bash
   npm run start -c
   ```

2. **Go to the server folder**:

   ```bash
   cd ./thestudentmaster/Server
   ```

3. **Install all required Python modules**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Backend**:

   ```bash
   uvicorn main:app --reload
   ```

   or

   ```bash
   python uvicorn main:app --reload
   ```

---

### 📬 Support and Feedback

For support or feedback regarding TheStudentMaster, please contact the development team at 📧 [support@thestudentmaster.de](mailto:support@thestudentmaster.de)

---
