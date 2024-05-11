// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { View, Pressable, useColorScheme } from "react-native";
import "nativewind";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface WeekSelectProps {
  onBackPress: () => void;
  onForwardPress: () => void;
  onTodayPress?: () => void;
  startDate?: Date;
  endDate?: Date;
  currentDate?: Date;
  mode: string;
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
//* WeekSelector mode needs to be either "calendar" or "menu"
//* WeekSelector needs to be passed functions for onBackPress, onForwardPress and onTodayPress if mode is "calendar"
//* WeekSelector needs to be passed functions for onBackPress, onForwardPress and startDate, endDate and currentDate if mode is "menu"
const WeekSelector: React.FC<WeekSelectProps> = ({
  onBackPress,
  onForwardPress,
  onTodayPress,
  startDate,
  endDate,
  currentDate,
  mode,
}) => {
  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // ~~~~~~~~~~~~ Default values ~~~~~~~~~~~ //
  // If no date is passed, the current date is used (this will happen if mode is calendar)
  const today = new Date();
  const safeCurrentDate = currentDate ?? today;
  const safeStartDate = startDate ?? today;
  const safeEndDate = endDate ?? today;

  // ====================================================== //
  // === Return Component with switch statement for mode == //
  // ====================================================== //
  switch (mode) {
    case "menu":
      // Handles the disabled state of the back and forward buttons
      const isBackDisabled = safeCurrentDate <= safeStartDate;
      const isForwardDisabled = safeCurrentDate >= safeEndDate;

      return (
        <View className="flex-row justify-between px-5 py-3">
          <Pressable
            onPress={onBackPress}
            disabled={isBackDisabled}
            className="active:opacity-50"
          >
            <Icon
              name="arrow-back-ios"
              size={30}
              color={
                isBackDisabled
                  ? isLight
                    ? "#7A7A7A"
                    : "#7A7A7A"
                  : isLight
                    ? "#7493BE"
                    : "#E0E2DB"
              }
            />
          </Pressable>
          <Pressable
            onPress={onForwardPress}
            disabled={isForwardDisabled}
            className="active:opacity-50"
          >
            <Icon
              name="arrow-forward-ios"
              size={30}
              color={
                isForwardDisabled
                  ? isLight
                    ? "#7A7A7A"
                    : "#7A7A7A"
                  : isLight
                    ? "#7493BE"
                    : "#E0E2DB"
              }
            />
          </Pressable>
        </View>
      );
    case "calendar":
      return (
        <View className="flex-row justify-between px-5 py-3">
          <Pressable onPress={onBackPress} className="active:opacity-50">
            <Icon
              name="arrow-back-ios"
              size={30}
              color={isLight ? "#7493BE" : "#E0E2DB"}
            />
          </Pressable>
          <Pressable onPress={onTodayPress} className="active:opacity-50">
            <Icon
              name="today"
              size={30}
              color={isLight ? "#7493BE" : "#E0E2DB"}
            />
          </Pressable>
          <Pressable onPress={onForwardPress} className="active:opacity-50">
            <Icon
              name="arrow-forward-ios"
              size={30}
              color={isLight ? "#7493BE" : "#E0E2DB"}
            />
          </Pressable>
        </View>
      );
    default:
      // If the mode is not "menu" or "calendar", an error is logged and null is returned
      console.error(
        "Incorrect mode: '" + mode + "'. Please choose 'menu' or 'calendar'.",
      );
      return null;
  }
};

export default WeekSelector;
