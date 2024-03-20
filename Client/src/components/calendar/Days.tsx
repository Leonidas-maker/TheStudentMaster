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
        start: new Date(2024, 3, 19, 9, 0),
        end: new Date(2024, 3, 19, 11, 0)
    },
    {
        id: 2,
        title: "Team Meeting 2",
        day: 2,
        start: new Date(2024, 3, 19, 10, 0),
        end: new Date(2024, 3, 19, 11, 0)
    },
];

const Days: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [containerHeight, setContainerHeight] = useState(0);

    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });

    const onLayout = (event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setContainerHeight(height);
        console.log(height)
    };


    return (
        <View className='flex-row' onLayout={onLayout}>
            <Hours />
            {Array.from({ length: 5 }).map((_, index) => {
                const day = addDays(startOfWeekDate, index);
                return (
                    <View key={index} className='flex-1 items-center p-2 border-l border-gray-200 border-b'>
                        <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                        <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                        {events.filter(event => event.day === index).map(event => (
                            <Event key={event.id} event={event} containerHeight={containerHeight} />
                        ))}
                    </View>
                );
            })}
        </View>
    );
};

export default Days;