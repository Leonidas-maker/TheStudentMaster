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
    calender: {
        startHour: number;
        endHour: number;
    }
}

const Event: React.FC<EventProps> = ({ event, containerHeight, calender }) => {
    let startHour: number, endHour: number, duration: number;
    containerHeight = containerHeight - 46;

    if (event.start.getDate() === event.end.getDate()) {
        startHour = event.start.getHours() + (event.start.getMinutes() / 60) - calender.startHour;
        endHour = event.end.getHours() + (event.end.getMinutes() / 60) - calender.startHour;
        duration = endHour - startHour;
        
    }
    else {
        // TODO Implement event spanning multiple days
        startHour = event.start.getHours() + (event.start.getMinutes() / 60) - calender.startHour;
        endHour = event.end.getHours() + (event.end.getMinutes() / 60) - calender.startHour;
        duration = endHour - startHour;
    }


    const totalHours = calender.endHour - calender.startHour + 1;
    const hourHeight = containerHeight / totalHours;
    const topPosition = startHour * hourHeight + 52;
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