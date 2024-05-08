// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, Text, Pressable } from "react-native";
import { format, addDays, isSameDay } from "date-fns";

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface DayViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  startOfWeekDate: Date;
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
// TODO Add swipe to change week
const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  setSelectedDate,
  startOfWeekDate,
}) => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex-row py-3">
      {Array.from({ length: 5 }).map((_, index) => {
        // Creates a new date for each day of the week
        const day = addDays(startOfWeekDate, index);
        // Checks if the day is the first day of the week, if true then it will not have a border on the left side
        const isFirstDay = index === 0;
        // Checks if the day is the selected day
        const isSelectedDay = isSameDay(day, selectedDate);

        return (
          <View className="flex-1">
            {isFirstDay ? (
              <Pressable
                key={index}
                className="items-center pt-2 z-10"
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  className={`text-lg text-black dark:text-white ${isSelectedDay ? "font-bold" : ""}`}
                >
                  {format(day, "eee")}
                </Text>
                <Text
                  className={`text-lg text-black dark:text-white ${isSelectedDay ? "font-bold" : ""}`}
                >
                  {format(day, "d")}. {format(day, "LLL")}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                key={index}
                className="items-center pt-2 border-l border-light_secondary dark:border-dark_secondary z-10"
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  className={`text-lg text-black dark:text-white ${isSelectedDay ? "font-bold" : ""}`}
                >
                  {format(day, "eee")}
                </Text>
                <Text
                  className={`text-lg text-black dark:text-white ${isSelectedDay ? "font-bold" : ""}`}
                >
                  {format(day, "d")}. {format(day, "LLL")}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default DayView;
