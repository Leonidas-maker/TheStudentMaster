import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import WeekCalendar from "../../components/calendar/WeekCalendar";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View className="bg-light_primary dark:bg-dark_primary flex-1">
      <WeekCalendar />
    </View>
  );
};

export default Dashboard;
