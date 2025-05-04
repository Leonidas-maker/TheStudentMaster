// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView
      edges={["top"]}
      className="bg-light_primary dark:bg-dark_primary flex-1"
    >
      <WeekCalendar />
    </SafeAreaView>
  );
}
