import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "./api";

interface Calendar {
  university_name: string;
  university_uuid: string;
  course_names: string[];
}

const fetchCalendars = async (setCalendars: (events: Calendar[]) => void) => {
  try {
    const response = await axiosInstance.get("/calendar/available_calendars");
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
) => {
  try {
    const storedUniversity = await AsyncStorage.getItem("selectedUniversity");
    if (storedUniversity) {
      const parsedUniversity = JSON.parse(storedUniversity);
      setSelectedUniversity(parsedUniversity);
      setPlaceholderUniversity(parsedUniversity.name);
    }
  } catch (err) {
    console.log("Failed to load selected university from storage", err);
  }
};

const getSelectedCourse = async (
  setSelectedCourse: (course: string) => void,
  setPlaceholderCourse: (course: string) => void,
) => {
  try {
    const storedCourse = await AsyncStorage.getItem("selectedCourse");
    if (storedCourse) {
      setSelectedCourse(storedCourse);
      setPlaceholderCourse(storedCourse);
    }
  } catch (err) {
    console.log("Failed to load selected course from storage", err);
  }
};

export { fetchCalendars, getSelectedUniversity, getSelectedCourse };
