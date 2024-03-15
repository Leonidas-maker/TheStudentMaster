import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';

import Hours from './Hours';
import Days from './Days';

const WeekCalendar: React.FC = () => {
    return (
        <View className="flex-row">
            <View className="flex-1">
                <Days />
                <Hours startHour = {0} endHour= {24} />
            </View>
        </View>
    );
};

export default WeekCalendar;
