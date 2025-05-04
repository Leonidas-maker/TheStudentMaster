// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import WeekCalendar from "../../components/calendar/WeekCalendar";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dashboard: React.FC = () => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="bg-light_primary dark:bg-dark_primary flex-1">
      <WeekCalendar />
    </View>
  );
};

export default Dashboard;
