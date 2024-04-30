// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View } from "react-native";
import "nativewind";
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableOpacity } from "react-native-gesture-handler";

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
          <TouchableOpacity onPress={onBackPress} disabled={isBackDisabled}>
            <Icon
              name="arrow-back-ios"
              size={30}
              color={isBackDisabled ? "#A0A0A2" : "#E0E0E2"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onForwardPress}
            disabled={isForwardDisabled}
          >
            <Icon
              name="arrow-forward-ios"
              size={30}
              color={isForwardDisabled ? "#A0A0A2" : "#E0E0E2"}
            />
          </TouchableOpacity>
        </View>
      );
    case "calendar":
      return (
        <View className="flex-row justify-between px-5 py-3">
          <TouchableOpacity onPress={onBackPress}>
            <Icon name="arrow-back-ios" size={30} color="#E0E0E2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onTodayPress}>
            <Icon name="today" size={30} color="#E0E0E2" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onForwardPress}>
            <Icon name="arrow-forward-ios" size={30} color="#E0E0E2" />
          </TouchableOpacity>
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
