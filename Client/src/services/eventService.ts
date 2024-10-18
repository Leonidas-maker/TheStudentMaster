// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { EventTimeProps } from "../interfaces/calendarInterfaces";

// Function to fetch events and update the state
const fetchEvents = async (forceFetch = false): Promise<EventTimeProps[]> => {
  const selectedUniversity = await AsyncStorage.getItem("selectedUniversity"); // Get selected university from storage
  const selectedCourse = await AsyncStorage.getItem("selectedCourse"); // Get selected course from storage
  const lastFetchTime = await AsyncStorage.getItem("lastFetchTime"); // Get last fetch time from storage
  const currentTime = new Date().getTime(); // Get the current time in milliseconds

  // Check if the last fetch was less than 15 minutes ago
  if (
    !forceFetch &&
    lastFetchTime &&
    currentTime - parseInt(lastFetchTime) < 15 * 60 * 1000
  ) {
    console.log("Fetching data skipped, less than 15 minutes since last fetch");
    return [];
  }

  if (selectedUniversity && selectedCourse) {
    const { uuid } = JSON.parse(selectedUniversity); // Parse selected university data
    let lastFetchHash = await AsyncStorage.getItem("lastFetchHash"); // Get last fetch hash from storage
    const hashResponse = await axios.get(
      `/calendar/${uuid}/${selectedCourse}/hash`,
    ); // Fetch the current hash for the selected course
    const currentHash = hashResponse.data.message; // Extract hash from the response

    // If the hash is the same as the last fetch, skip the fetch
    if (!forceFetch && lastFetchHash && currentHash === lastFetchHash) {
      console.log("No changes in data, skipping fetch.");
      await AsyncStorage.setItem("lastFetchTime", currentTime.toString()); // Update the last fetch time in storage
      return [];
    }

    const response = await axios.get(`/calendar/${uuid}/${selectedCourse}`); // Fetch events for the selected course
    const data = response.data.data; // Extract data from the response

    if (data && Array.isArray(data.events)) {
      const formattedEvents = data.events.map((event: EventTimeProps) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })); // Format event dates

      await AsyncStorage.setItem("events", JSON.stringify(formattedEvents)); // Store events in storage
      await AsyncStorage.setItem("lastFetchTime", currentTime.toString()); // Update the last fetch time in storage
      if (currentHash) {
        await AsyncStorage.setItem("lastFetchHash", currentHash); // Update the last fetch hash in storage
      }
      return formattedEvents; // Return formatted events
    } else {
      console.error("Unexpected response format:", data); // Log error if response format is unexpected
    }
  }
  return [];
};

// Function to fetch events without waiting for the last fetch time
const fetchEventsWithoutWait = async (
  setEvents: (events: EventTimeProps[]) => void,
) => {
  try {
    const selectedUniversity = await AsyncStorage.getItem("selectedUniversity"); // Get selected university from storage
    const selectedCourse = await AsyncStorage.getItem("selectedCourse"); // Get selected course from storage
    const currentTime = new Date().getTime(); // Get the current time in milliseconds

    if (selectedUniversity && selectedCourse) {
      const { uuid } = JSON.parse(selectedUniversity); // Parse selected university data
      const response = await axios.get(`/calendar/${uuid}/${selectedCourse}`); // Fetch events for the selected course
      const data = response.data.data; // Extract data from the response

      if (data && Array.isArray(data.events)) {
        const formattedEvents = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        })); // Format event dates

        setEvents(formattedEvents); // Update state with formatted events
        await AsyncStorage.setItem("events", JSON.stringify(formattedEvents)); // Store events in storage
        await AsyncStorage.setItem("lastFetchTime", currentTime.toString()); // Update the last fetch time in storage
      } else {
        console.error("Unexpected response format:", data); // Log error if response format is unexpected
      }
    }
  } catch (error) {
    console.error("Error fetching events:", error); // Log any errors that occur
  }
};

// Function to load events from storage and update the state
const loadEventsFromStorage = async (
  setEvents: (events: EventTimeProps[]) => void,
) => {
  try {
    const storedEvents = await AsyncStorage.getItem("events"); // Get stored events from storage
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents).map(
        (event: EventTimeProps) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }),
      ); // Parse and format event dates
      setEvents(parsedEvents); // Update state with parsed events
    }
  } catch (error) {
    console.error("Error loading events from storage:", error); // Log any errors that occur
  }
};

export { fetchEvents, fetchEventsWithoutWait, loadEventsFromStorage };
