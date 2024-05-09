import React from "react";
import { View } from "react-native";

import WeekCalendar from "../../components/calendar/WeekCalendar";

const Dashboard: React.FC = () => {

  return (
    <View className="bg-light_primary dark:bg-dark_primary flex-1">
      <WeekCalendar />
    </View>
  );
};

export default Dashboard;
