// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, Text } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import WeekCalendar from "../../components/calendar/WeekCalendar";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
export default function Tab() {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="bg-light_primary dark:bg-dark_primary flex-1">
      <WeekCalendar />
    </View>
  );
};