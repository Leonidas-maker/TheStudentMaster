import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import 'nativewind';
import { format, startOfWeek, addDays } from 'date-fns';

import Hours from './Hours';
import Event from './Event';

//! Event import will be moved to WeekCalendar

const events = [
    {
        id: 1,
        title: "Team Meeting",
        day: 1,
        start: new Date(2024, 3, 25, 9, 0),
        end: new Date(2024, 3, 25, 11, 0)
    },
    {
        id: 2,
        title: "Team Meeting 2",
        day: 2,
        start: new Date(2024, 3, 26, 12, 0),
        end: new Date(2024, 3, 26, 13, 0)
    },
];

const Days: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [containerHeight, setContainerHeight] = useState(0);
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const calenderHours = { startHour: 8, endHour: 19 };

    const onLayout = (event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setContainerHeight(height);
    };

    return (
        <View className='flex-1 flex-row w-full'>
            <Hours startHour={calenderHours.startHour} endHour={calenderHours.endHour} />
            <View className='flex-1 flex-row justify-between' onLayout={onLayout}>
                {Array.from({ length: 5 }).map((_, index) => {
                    const day = addDays(startOfWeekDate, index);
                    return (
                        <View key={index} className='flex-1 items-center pt-2 border-l border-gray-200'>
                            <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                            <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                            {events.filter(event => event.start.getDate() === day.getDate()).map(event => (
                                <Event key={event.id} event={event} containerHeight={containerHeight} calender={calenderHours} />
                            ))}
                        </View>
                    );
                })}
                <View />
            </View>
        </View>

    );
};

export default Days;