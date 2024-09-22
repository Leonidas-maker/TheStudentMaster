// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { CalendarProps } from "../interfaces/calendarInterfaces";

// Function to fetch available calendars and update the state
const fetchCalendars = async (
  setCalendars: (events: CalendarProps[]) => void,
) => {
  try {
    const response = await axios.get("/calendar/available_calendars"); // Make a GET request to fetch calendars
    setCalendars(response.data); // Update the state with fetched calendar data
  } catch (err) {
    console.log("Failed to load calendars", err); // Log any errors that occur
  }
};

// This function is used to get the selected university from the storage
const getSelectedUniversity = async (
  setSelectedUniversity: (
    university: { name: string; uuid: string } | null,
  ) => void,
  setPlaceholderUniversity: (name: string) => void,
  setMissingUniversity: (missing: boolean) => void,
) => {
  try {
    const storedUniversity = await AsyncStorage.getItem("selectedUniversity"); // Retrieve selected university from storage
    if (storedUniversity) {
      const parsedUniversity = JSON.parse(storedUniversity); // Parse the stored university data
      setSelectedUniversity(parsedUniversity); // Update the state with the selected university
      setPlaceholderUniversity(parsedUniversity.name); // Update the placeholder with the university name
      setMissingUniversity(false); // Set missing university to false
    } else {
      setMissingUniversity(true); // Set missing university to true if not found
    }
  } catch (err) {
    console.log("Failed to load selected university from storage", err); // Log any errors that occur
    setMissingUniversity(true); // Set missing university to true if an error occurs
  }
};

// Function to get the selected course from the storage
const getSelectedCourse = async (
  setSelectedCourse: (course: string) => void,
  setPlaceholderCourse: (course: string) => void,
  setMissingCourse: (missing: boolean) => void,
) => {
  try {
    const storedCourse = await AsyncStorage.getItem("selectedCourse"); // Retrieve selected course from storage
    if (storedCourse) {
      setSelectedCourse(storedCourse); // Update the state with the selected course
      setPlaceholderCourse(storedCourse); // Update the placeholder with the course name
      setMissingCourse(false); // Set missing course to false
    } else {
      setMissingCourse(true); // Set missing course to true if not found
    }
  } catch (err) {
    console.log("Failed to load selected course from storage", err); // Log any errors that occur
    setMissingCourse(true); // Set missing course to true if an error occurs
  }
};

// Function to fetch the initial hash value and store it in AsyncStorage
const fetchInitialHash = async (universityUuid: string, courseName: string) => {
  try {
    const hashResponse = await axios.get(
      `/calendar/${universityUuid}/${courseName}/hash`, // Make a GET request to fetch the hash value
    );
    const currentHash = hashResponse.data.message; // Extract the hash value from the response

    if (currentHash) {
      await AsyncStorage.setItem("lastFetchHash", currentHash); // Store the hash value in AsyncStorage
    }
  } catch (error) {
    console.error("Error fetching initial hash:", error); // Log any errors that occur
  }
};

export {
  fetchCalendars,
  getSelectedUniversity,
  getSelectedCourse,
  fetchInitialHash,
};
