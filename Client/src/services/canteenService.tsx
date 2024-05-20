import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "./api";

interface CanteenProps {
  key: string;
  value: string;
}

interface CanteenResponse {
  canteen_name: string;
  canteen_short_name: string;
  image_url: string;
}

interface Dish {
  dish_type: string;
  dish: string;
  price: string;
  serving_date: string;
}

interface MenuData {
  canteen_name: string;
  canteen_short_name: string;
  image_url: string | null;
  menu: Dish[];
}

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
      await AsyncStorage.setItem("lastFetchTimeCanteen", currentTime.toString());
      return;
    }

    const response = await axiosInstance.get<CanteenResponse[]>("/canteen/all");
    const canteenData = response.data.map((canteen: CanteenResponse) => ({
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
  setMenu: (menu: MenuData | null) => void,
) => {
  try {
    const response = await axiosInstance.get<MenuData>(
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
