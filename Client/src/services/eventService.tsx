import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "./api";

interface Event {
  start: string | Date;
  end: string | Date;
  [key: string]: any;
}

const fetchEvents = async (setEvents: (events: Event[]) => void) => {
  try {
    const selectedUniversity = await AsyncStorage.getItem("selectedUniversity");
    const selectedCourse = await AsyncStorage.getItem("selectedCourse");
    const lastFetchTime = await AsyncStorage.getItem("lastFetchTime");
    const currentTime = new Date().getTime();

    if (
      lastFetchTime &&
      currentTime - parseInt(lastFetchTime) < 15 * 60 * 1000
    ) {
      console.log(
        "Fetching data skipped, less than 15 minutes since last fetch",
      );
      return;
    }

    if (selectedUniversity && selectedCourse) {
      const { uuid } = JSON.parse(selectedUniversity);
      const response = await axiosInstance.get(
        `/calendar/${uuid}/${selectedCourse}`,
      );
      const data = response.data.data;

      if (data && Array.isArray(data.events)) {
        const formattedEvents = data.events.map((event: Event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));

        setEvents(formattedEvents);
        await AsyncStorage.setItem("events", JSON.stringify(formattedEvents));
        await AsyncStorage.setItem("lastFetchTime", currentTime.toString());
      } else {
        console.error("Unexpected response format:", data);
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const fetchEventsWithoutWait = async (setEvents: (events: Event[]) => void) => {
  try {
    const selectedUniversity = await AsyncStorage.getItem("selectedUniversity");
    const selectedCourse = await AsyncStorage.getItem("selectedCourse");
    const currentTime = new Date().getTime();

    if (selectedUniversity && selectedCourse) {
      const { uuid } = JSON.parse(selectedUniversity);
      const response = await axiosInstance.get(
        `/calendar/${uuid}/${selectedCourse}`,
      );
      const data = response.data.data;

      if (data && Array.isArray(data.events)) {
        const formattedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));

        setEvents(formattedEvents);
        await AsyncStorage.setItem("events", JSON.stringify(formattedEvents));
        await AsyncStorage.setItem("lastFetchTime", currentTime.toString());
      } else {
        console.error("Unexpected response format:", data);
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
};

const loadEventsFromStorage = async (setEvents: (events: Event[]) => void) => {
  try {
    const storedEvents = await AsyncStorage.getItem("events");
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents).map((event: Event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(parsedEvents);
    }
  } catch (error) {
    console.error("Error loading events from storage:", error);
  }
};

export { fetchEvents, fetchEventsWithoutWait, loadEventsFromStorage };
