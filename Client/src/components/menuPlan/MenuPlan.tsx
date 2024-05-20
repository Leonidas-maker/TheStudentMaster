import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  startOfWeek,
  subWeeks,
  addWeeks,
  isSameWeek,
  isSaturday,
  isSunday,
  setDay,
} from "date-fns";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DayView from "./DayView";
import DishView from "./DishView";
import WeekSelector from "../selector/WeekSelector";
import Dropdown from "../dropdown/Dropdown";
import { fetchCanteens, fetchCanteenDishes } from "../../services/canteenService";

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface CanteenProps {
  key: string;
  value: string;
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

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const MenuPlan: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [selectedCanteen, setSelectedCanteen] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todaysDate, setTodaysDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [canteenNames, setCanteenNames] = useState<CanteenProps[]>([]);
  const [menu, setMenu] = useState<MenuData | null>(null);

  // ====================================================== //
  // ====================== Constants ===================== //
  // ====================================================== //
  const scrollViewRef = useRef<ScrollView>(null);
  const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const startOfMenuDate = startOfWeek(todaysDate, { weekStartsOn: 1 });
  const endOfMenuDate = startOfWeek(addWeeks(todaysDate, 1), {
    weekStartsOn: 1,
  });

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Sets current week to the start of the week based on the current date
  useEffect(() => {
    setCurrentWeek(startOfWeek(currentDate, { weekStartsOn: 1 }));
  }, [currentDate]);

  // Sets the selected date to the current date and adjusts it for the weekend (if weekend then set to friday)
  useEffect(() => {
    setSelectedDate((date) => adjustDateForWeekend(date));
  }, []);

  // Sets the canteen names to the canteen name data
  useFocusEffect(
    useCallback(() => {
      const loadCanteens = async () => {
        await fetchCanteens(setCanteenNames);
      };

      loadCanteens();
    }, []),
  );

  // Fetches the dishes for the selected canteen whenever it changes
  useEffect(() => {
    if (selectedCanteen && canteenNames.length > 0) {
      const canteen = canteenNames.find((canteen) => canteen.key === selectedCanteen);
      if (canteen) {
        fetchCanteenDishes(canteen.key, setMenu);
      }
    }
  }, [selectedCanteen, canteenNames]);

  // Scrolls to the top of the ScrollView when the selected date changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, [selectedDate]);

  // ====================================================== //
  // ===================== Animations ===================== //
  // ====================================================== //
  // Important for LayoutAnimation on Android according to the docs
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  // Defines the animation for the transition between weeks (animation: easeInEaseOut)
  const animateTransition = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  // Adjusts the date for the weekend (if weekend then set to friday)
  const adjustDateForWeekend = (date: Date): Date => {
    if (isSaturday(date) || isSunday(date)) {
      return setDay(subWeeks(date, 1), 5);
    } else {
      const today = new Date();
      return setDay(date, today.getDay());
    }
  };

  // Updates the date to the new date and adjusts it for the weekend (if weekend then set to friday)
  const updateDate = (newDate: Date): Date => {
    const today = new Date();
    if (isSameWeek(newDate, today, { weekStartsOn: 1 })) {
      const adjustedToday = adjustDateForWeekend(today);
      setSelectedDate(adjustedToday);
    } else {
      setSelectedDate(startOfWeek(newDate, { weekStartsOn: 1 }));
    }
    return newDate;
  };

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  // Handles the back press by subtracting a week from the current displayed date
  const handleBackPress = () => {
    animateTransition();
    setCurrentDate((current) => updateDate(subWeeks(current, 1)));
  };

  // Handles the forward press by adding a week to the current displayed date
  const handleForwardPress = () => {
    animateTransition();
    setCurrentDate((current) => updateDate(addWeeks(current, 1)));
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex-1">
      <WeekSelector
        mode={"menu"}
        onBackPress={handleBackPress}
        onForwardPress={handleForwardPress}
        currentDate={currentWeek}
        startDate={startOfMenuDate}
        endDate={endOfMenuDate}
      />
      <DayView
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startOfWeekDate={startOfWeekDate}
      />
      <DishView
        menu={menu}
        scrollViewRef={scrollViewRef}
        selectedCanteen={selectedCanteen}
        selectedDate={selectedDate}
      />
      <Dropdown
        setSelected={setSelectedCanteen}
        values={canteenNames}
        placeholder="Mensa auswählen"
        save="key"
      />
    </View>
  );
};

export default MenuPlan;