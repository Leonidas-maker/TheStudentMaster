import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  CanteenResponseProps,
  CanteenProps,
  MenuDataProps,
} from "../interfaces/CanteenInterfaces";

const fetchCanteens = async (
  setCanteenNames: (canteens: CanteenProps[]) => void,
) => {
  try {
    const lastFetchTimeCanteen = await AsyncStorage.getItem(
      "lastFetchTimeCanteen",
    );
    const currentTime = new Date().getTime();

    if (
      lastFetchTimeCanteen &&
      currentTime - parseInt(lastFetchTimeCanteen) < 15 * 60 * 1000
    ) {
      console.log(
        "Fetching data skipped, less than 15 minutes since last fetch",
      );
      const cachedCanteens = await AsyncStorage.getItem("canteens");
      if (cachedCanteens) {
        setCanteenNames(JSON.parse(cachedCanteens));
      }
      await AsyncStorage.setItem(
        "lastFetchTimeCanteen",
        currentTime.toString(),
      );
      return;
    }

    const response = await axios.get<CanteenResponseProps[]>("/canteen/all");
    const canteenData = response.data.map((canteen: CanteenResponseProps) => ({
      key: canteen.canteen_short_name,
      value: canteen.canteen_name,
    }));

    await AsyncStorage.setItem("canteens", JSON.stringify(canteenData));
    await AsyncStorage.setItem("lastFetchTimeCanteen", currentTime.toString());

    setCanteenNames(canteenData);
  } catch (error) {
    console.error("Error fetching canteens:", error);
  }
};

const fetchCanteenDishes = async (
  canteenShortName: string,
  setMenu: (menu: MenuDataProps | null) => void,
) => {
  try {
    const response = await axios.get<MenuDataProps>(
      `/canteen/${canteenShortName}/menu/all`,
    );
    const menuData = response.data;
    setMenu(menuData);
  } catch (error) {
    console.error("Error fetching canteen dishes:", error);
    setMenu(null);
  }
};

export { fetchCanteens, fetchCanteenDishes };
