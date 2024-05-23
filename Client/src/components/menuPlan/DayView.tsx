import React from "react";
import { View, Text, Pressable } from "react-native";
import { format, addDays, isSameDay } from "date-fns";
import { DayViewProps } from "../../interfaces/canteenProps";

const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  setSelectedDate,
  startOfWeekDate,
}) => {
  return (
    <View className="flex-row py-3">
      {Array.from({ length: 5 }).map((_, index) => {
        const day = addDays(startOfWeekDate, index);
        const isFirstDay = index === 0;
        const isSelectedDay = isSameDay(day, selectedDate);
        const key = format(day, "yyyy-MM-dd");

        return (
          <View className="flex-1" key={key}>
            <Pressable
              className={`items-center pt-2 ${isFirstDay ? "" : "border-l border-light_secondary dark:border-dark_secondary"} z-10 active:opacity-50`}
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
          </View>
        );
      })}
    </View>
  );
};

export default DayView;
