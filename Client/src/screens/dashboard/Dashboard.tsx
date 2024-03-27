import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import WeekCalendar from "../../components/calendar/WeekCalendar";


function Dashboard() {

    const { t } = useTranslation();

    return (
        <View className='bg-primary flex-1'>
            <WeekCalendar />
        </View>
    );
}

export default Dashboard;
