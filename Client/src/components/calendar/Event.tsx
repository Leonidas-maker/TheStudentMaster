import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';

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
    let eventStart: number, eventEnd: number, eventDuration: number;

    // Event calculation for same day event
    if (event.start.getDate() === event.end.getDate()) {
        // Event start calculation in hours minus the start hour of the calender
        eventStart = event.start.getHours() + (event.start.getMinutes() / 60) - calender.startHour;
        // Event end calculation in hours minus the start hour of the calender
        eventEnd = event.end.getHours() + (event.end.getMinutes() / 60) - calender.startHour;
        // Event duration calculation
        eventDuration = eventEnd - eventStart;
    }
    else {
        // TODO Implement event spanning multiple days
        eventStart = event.start.getHours() + (event.start.getMinutes() / 60) - calender.startHour;
        eventEnd = event.end.getHours() + (event.end.getMinutes() / 60) - calender.startHour;
        eventDuration = eventEnd - eventStart;
    }

    // Calculates the difference between the day container and the hours container
    const dayHeight = containerHeight - hoursContainerHeight;
    // Calculates the total hours displayed in the calender
    const totalHours = calender.endHour - calender.startHour;
    // Calculates the height of 1 hour
    const hourHeight = hoursContainerHeight / totalHours;
    // Calculates the top position of the event with event start time times the hour height 
    // plus the difference between the day container and the hours container
    const topPosition = eventStart * hourHeight + dayHeight;
    // Calculates the total height of the event with the event duration times the hour height
    const eventHeight = eventDuration * hourHeight;

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