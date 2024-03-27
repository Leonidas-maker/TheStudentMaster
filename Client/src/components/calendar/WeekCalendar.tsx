import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';

import Days from './Days';
import Weeks from './Weeks';

const WeekCalendar: React.FC = () => {
    return (
        <View className="h-full flex-1">
            <Weeks />
            <Days />
        </View>
    );
};

export default WeekCalendar;
