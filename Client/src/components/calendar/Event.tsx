import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';

//! Events not displayed in the right spot on web
//! Event start is a bit to high on some devices

interface EventProps {
    event: {
        id: number;
        title: string;
        description?: string;
        start: Date;
        end: Date;
    },
    hoursContainerHeight: number;
    containerHeight: number;
    calender: {
        startHour: number;
        endHour: number;
    }
}

const Event: React.FC<EventProps> = ({ event, hoursContainerHeight, containerHeight, calender }) => {
    let startHour: number, endHour: number, duration: number;

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

    //! Need to find better names

    const height = containerHeight - hoursContainerHeight;
    const totalHours = calender.endHour - calender.startHour;
    const hourHeight = hoursContainerHeight / totalHours;
    const topPosition = startHour * hourHeight + height;
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