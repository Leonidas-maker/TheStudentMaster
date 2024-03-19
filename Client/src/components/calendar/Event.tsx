import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';

//! Positioning needs to be fixed

interface EventProps {
    event: {
        id: number;
        title: string;
        description?: string;
        start: Date;
        end: Date;
    },
    containerHeight: number;
}

const Event: React.FC<EventProps> = ({ event, containerHeight }) => {
    const calendarStartHour = 8;
    const startHour = event.start.getHours() + (event.start.getMinutes() / 60) - calendarStartHour;
    const endHour = event.end.getHours() + (event.end.getMinutes() / 60) - calendarStartHour;
    const duration = endHour - startHour;

    const totalHours = 19 - 8;
    const hourHeight = containerHeight / totalHours;
    const topPosition = startHour * hourHeight + 26;
    const eventHeight = duration * hourHeight;

    return (
        <View 
        className='bg-blue-500'
        style={{
            position: 'absolute',
            top: topPosition,
            width: '100%',
            height: eventHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text className='text-white'>{event.title}</Text>
        </View>
    );
};

export default Event;