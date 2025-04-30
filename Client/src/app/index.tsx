// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, Text } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import WeekCalendar from "../components/calendar/WeekCalendar";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dashboard: React.FC = () => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="bg-light_primary dark:bg-dark_primary flex-1">
      <Text>Hello, World!</Text>
    </View>
  );
};

export default Dashboard;
