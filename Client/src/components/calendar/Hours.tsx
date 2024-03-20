import React from 'react';
import { View, Text, useWindowDimensions, Platform } from 'react-native';
import 'nativewind';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

//* Prop startHour expects an integer between 0 and 24 (optional - default: 8)
//* Prop endHour expects an integer between 0 and 24, endHour has to be greater than startHour (optional - default: 19)

interface HoursProps {
    startHour?: number;
    endHour?: number;
}

const Hours: React.FC<HoursProps> = ({ startHour = 8, endHour = 19 }) => {
    if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
        throw new Error("startHour and endHour must be an integer.");
    }
    if (startHour < 0 || startHour > 24 || endHour < 0 || endHour > 24) {
        throw new Error("startHour and endHour must be between 0 and 24.");
    }
    if (endHour <= startHour) {
        throw new Error("endHour must be greater than startHour.");
    }

    //! Need to find a way how to use the full screen size for the calendar
    const screenHeight = useWindowDimensions().height;
    const scale = useWindowDimensions().scale;
    const tabBarHeight = useBottomTabBarHeight();
    const baseFontSize = 16;
    const remInPixels = (4 * baseFontSize) * scale;
    const percentageOfScreenHeightForRem = remInPixels / screenHeight;
    const percentageOfScreenHeightForTabBar = tabBarHeight / screenHeight;
    const remainingPercentageForHours = 1 - percentageOfScreenHeightForRem - percentageOfScreenHeightForTabBar;

    const hoursCount = endHour - startHour + 1;
    const hours = Array.from({ length: hoursCount }, (_, i) => startHour + i);

    const usableHeight = screenHeight * remainingPercentageForHours;
    const hoursHeight = usableHeight / hoursCount;

    console.log(screenHeight)
    console.log(remainingPercentageForHours)
    console.log(useWindowDimensions().scale)
    console.log(tabBarHeight)

    return (
        <View className="w-14">
            <View className='items-center p-2 border-gray-200 border-b'>
                <Text className='text-lg text-primary'>NA</Text>
                <Text className='text-sm text-primary'>NA</Text>
            </View>
            {hours.map((hour) => (
                <View key={hour} className="border-b border-gray-200 flex justify-top" style={{ height: hoursHeight }}>
                    <Text className="text-xs text-center text-white">{`${hour}:00`}</Text>
                </View>
            ))}
        </View>
    );
};

export default Hours;