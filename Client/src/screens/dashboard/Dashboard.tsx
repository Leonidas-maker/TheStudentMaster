import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import WeekCalendar from "../../components/calendar/WeekCalendar";

function Dashboard() {

    const { t } = useTranslation();

    return (
        <View className='h-screen bg-primary'>
            <WeekCalendar />
        </View>
    );
}

export default Dashboard;
