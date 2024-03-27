import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';

import Days from './Days';

const WeekCalendar: React.FC = () => {
    return (
        <View className="h-full flex-1">
            <Days />
        </View>
    );
};

export default WeekCalendar;
