// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import {
  CanteenResponseProps,
  CanteenProps,
  MenuDataProps,
} from "../interfaces/canteenInterfaces";

// Function to fetch the list of canteens and update the state
const fetchCanteens = async (
  setCanteenNames: (canteens: CanteenProps[]) => void,
) => {
  try {
    const lastFetchTimeCanteen = await AsyncStorage.getItem(
      "lastFetchTimeCanteen",
    ); // Get the last fetch time from storage
    const currentTime = new Date().getTime(); // Get the current time in milliseconds

    // Check if the last fetch was less than 15 minutes ago
    if (
      lastFetchTimeCanteen &&
      currentTime - parseInt(lastFetchTimeCanteen) < 15 * 60 * 1000
    ) {
      console.log(
        "Fetching data skipped, less than 15 minutes since last fetch",
      );
      const cachedCanteens = await AsyncStorage.getItem("canteens"); // Get cached canteens from storage
      if (cachedCanteens) {
        setCanteenNames(JSON.parse(cachedCanteens)); // Update state with cached canteens
      }
      await AsyncStorage.setItem(
        "lastFetchTimeCanteen",
        currentTime.toString(),
      ); // Update the last fetch time in storage
      return;
    }

    // Fetch canteens from the server
    const response = await axios.get<CanteenResponseProps[]>("/canteen/all");
    const canteenData = response.data.map((canteen: CanteenResponseProps) => ({
      key: canteen.canteen_short_name,
      value: canteen.canteen_name,
    }));

    await AsyncStorage.setItem("canteens", JSON.stringify(canteenData)); // Store fetched canteens in storage
    await AsyncStorage.setItem("lastFetchTimeCanteen", currentTime.toString()); // Update the last fetch time in storage

    setCanteenNames(canteenData); // Update state with fetched canteens
  } catch (error) {
    console.error("Error fetching canteens:", error); // Log any errors that occur
  }
};

// Function to fetch dishes of a specific canteen and update the state
const fetchCanteenDishes = async (
  canteenShortName: string,
  setMenu: (menu: MenuDataProps | null) => void,
) => {
  try {
    const response = await axios.get<MenuDataProps>(
      `/canteen/${canteenShortName}/menu/all`,
    ); // Make a GET request to fetch the menu for a specific canteen
    const menuData = response.data;
    setMenu(menuData); // Update state with fetched menu data
  } catch (error) {
    console.error("Error fetching canteen dishes:", error); // Log any errors that occur
    setMenu(null); // Set menu to null if an error occurs
  }
};

export { fetchCanteens, fetchCanteenDishes };
