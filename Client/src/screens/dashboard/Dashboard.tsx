import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WeekCalendar from "../../components/calendar/WeekCalendar";


function Dashboard() {

    const { t } = useTranslation();
    const insets = useSafeAreaInsets();


    return (
        <View  style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
    
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }} className='bg-primary'>
            
            <WeekCalendar />
        </View>
    );
}

export default Dashboard;
