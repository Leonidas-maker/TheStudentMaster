// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, Text, Pressable } from "react-native";
import { format, addDays, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { de } from "date-fns/locale/de";

import { useTranslation } from "react-i18next";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { DayViewProps } from "../../interfaces/canteenInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  setSelectedDate,
  startOfWeekDate,
}) => {
  const { i18n } = useTranslation();

  // Checks the current language and sets the locale accordingly
  const locale = i18n.language === "de" ? de : enUS;
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex-row py-3">
      {Array.from({ length: 5 }).map((_, index) => {
        // Calculates the day
        const day = addDays(startOfWeekDate, index);
        // Checks if it is the first day
        const isFirstDay = index === 0;
        // Checks if it is the same day
        const isSelectedDay = isSameDay(day, selectedDate);
        // Generates the key for the tile
        const key = format(day, "yyyy-MM-dd");

        // ~~~ Return component inside function ~~ //
        return (
          <View className="flex-1" key={key}>
            <Pressable
              className={`items-center pt-2 ${isFirstDay ? "" : "border-l border-light_secondary dark:border-dark_secondary"} z-10 active:opacity-50`}
              onPress={() => setSelectedDate(day)}
            >
              <Text
                className={`text-lg text-black dark:text-white ${isSelectedDay ? "font-bold" : ""}`}
              >
                {/* Format the weekday using the selected locale */}
                {format(day, "eee", { locale })}
              </Text>
              <Text
                className={`text-lg text-black dark:text-white ${isSelectedDay ? "font-bold" : ""}`}
              >
                {/* Format the day and month using the selected locale */}
                {format(day, "d", { locale })}. {format(day, "LLL", { locale })}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

export default DayView;
