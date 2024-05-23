import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { CalendarProps } from "../interfaces/calendarInterfaces";

const fetchCalendars = async (
  setCalendars: (events: CalendarProps[]) => void,
) => {
  try {
    const response = await axios.get("/calendar/available_calendars");
    setCalendars(response.data);
  } catch (err) {
    console.log("Failed to load calendars", err);
  }
};

const getSelectedUniversity = async (
  setSelectedUniversity: (
    university: { name: string; uuid: string } | null,
  ) => void,
  setPlaceholderUniversity: (name: string) => void,
  setMissingUniversity: (missing: boolean) => void,
) => {
  try {
    const storedUniversity = await AsyncStorage.getItem("selectedUniversity");
    if (storedUniversity) {
      const parsedUniversity = JSON.parse(storedUniversity);
      setSelectedUniversity(parsedUniversity);
      setPlaceholderUniversity(parsedUniversity.name);
      setMissingUniversity(false);
    } else {
      setMissingUniversity(true);
    }
  } catch (err) {
    console.log("Failed to load selected university from storage", err);
    setMissingUniversity(true);
  }
};

const getSelectedCourse = async (
  setSelectedCourse: (course: string) => void,
  setPlaceholderCourse: (course: string) => void,
  setMissingCourse: (missing: boolean) => void,
) => {
  try {
    const storedCourse = await AsyncStorage.getItem("selectedCourse");
    if (storedCourse) {
      setSelectedCourse(storedCourse);
      setPlaceholderCourse(storedCourse);
      setMissingCourse(false);
    } else {
      setMissingCourse(true);
    }
  } catch (err) {
    console.log("Failed to load selected course from storage", err);
    setMissingCourse(true);
  }
};

const fetchInitialHash = async (universityUuid: string, courseName: string) => {
  try {
    const hashResponse = await axios.get(
      `/calendar/${universityUuid}/${courseName}/hash`,
    );
    const currentHash = hashResponse.data.message;

    if (currentHash) {
      await AsyncStorage.setItem("lastFetchHash", currentHash);
    }
  } catch (error) {
    console.error("Error fetching initial hash:", error);
  }
};

export {
  fetchCalendars,
  getSelectedUniversity,
  getSelectedCourse,
  fetchInitialHash,
};
