import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import 'nativewind';

interface EventProps {
    event: {
        summary: string;
        description?: string | null;
        location?: string;
        start: Date;
        end: Date;
    },
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    },
    overlapCount?: number;
    overlapIndex?: number;
}

//TODO Implement all day events
const Event: React.FC<EventProps> = ({ event, hoursContainerHeight, containerHeight, calendar, overlapCount = 1, overlapIndex = 0 }) => {
    let eventStart: number, eventEnd: number, eventDuration: number;

    // Event calculation for same day event
    if (event.start.getDate() === event.end.getDate()) {
        // Event start calculation in hours minus the start hour of the calender
        eventStart = event.start.getHours() + (event.start.getMinutes() / 60) - calendar.startHour;
        // Event end calculation in hours minus the start hour of the calender
        eventEnd = event.end.getHours() + (event.end.getMinutes() / 60) - calendar.startHour;
        // Event duration calculation
        eventDuration = eventEnd - eventStart;
    }
    else {
        // TODO Implement event spanning multiple days
        eventStart = event.start.getHours() + (event.start.getMinutes() / 60) - calendar.startHour;
        eventEnd = event.end.getHours() + (event.end.getMinutes() / 60) - calendar.startHour;
        eventDuration = eventEnd - eventStart;
    }

    // Calculates the difference between the day container and the hours container
    const dayHeight = containerHeight - hoursContainerHeight;
    // Calculates the total hours displayed in the calender
    const totalHours = calendar.endHour - calendar.startHour;
    // Calculates the height of 1 hour
    const hourHeight = hoursContainerHeight / totalHours;
    // Calculates the top position of the event with event start time times the hour height 
    // plus the difference between the day container and the hours container
    const topPosition = eventStart * hourHeight + dayHeight;
    // Calculates the total height of the event with the event duration times the hour height
    const eventHeight = eventDuration * hourHeight;

    const handleEventPress = () => {
        console.log(event);
    };

    const eventWidth = 100 / overlapCount;
    const leftPosition = (100 / overlapCount) * overlapIndex;

    return (
        <TouchableOpacity
            onPress={handleEventPress}
            className='bg-blue-500 rounded-lg shadow-sm'
            style={{
                position: 'absolute',
                top: topPosition,
                left: `${leftPosition}%`,
                width: `${eventWidth}%`,
                height: eventHeight,
            }}>
            <Text className='text-white pt-2 px-1'>{event.summary}</Text>
        </TouchableOpacity>
    );
};

export default Event;