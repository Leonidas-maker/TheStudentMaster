import React, { useState, useEffect } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import 'nativewind';
import { format, startOfWeek, addDays, isSameDay, isToday, isPast, endOfWeek, isWithinInterval } from 'date-fns';

import Hours from './Hours';
import Event from './Event';
import TimeMarker from './TimeMarker';
import PastMarker from './PastMarker';

interface Event {
    summary: string;
    description?: string | null;
    location?: string;
    start: Date;
    end: Date;
    overlapCount?: number;
    overlapIndex?: number;
};

const Days: React.FC<{ currentDate: Date; events: Array<any>; }> = ({ currentDate, events }) => {
    // State to store the height of the container
    const [containerHeight, setContainerHeight] = useState(0);
    // State to store the height of the hours container
    const [hoursContainerHeight, setHoursContainerHeight] = useState(0);
    // Sets the start of the current week
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    // Sets the end of the current week
    const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    // State to store the hours of the calendar
    const [calenderHours, setCalenderHours] = useState({ startHour: 8, endHour: 20 });

    //? Maybe we need to do this more efficiently
    // Calculates the calendar hours when the events or the current date changes
    useEffect(() => {
        calculateCalendarHours();
    }, [events, currentDate]);

    const calculateCalendarHours = () => {
        // Filters events that are within the current week
        const eventsThisWeek = events.filter(event => 
            isWithinInterval(event.start, { start: startOfWeekDate, end: endOfWeekDate })
        );

        // Sets calenderHours back to a default value if no events are found
        if (eventsThisWeek.length === 0) {
            setCalenderHours({ startHour: 8, endHour: 20 });
            return;
        }

        // Sets start values for earliestStartHour and latestEndHour
        let earliestStartHour = Infinity;
        let latestEndHour = -Infinity;

        // Loops through the events to find the earliest start and latest end hour
        eventsThisWeek.forEach(event => {
            const startHour = event.start.getHours();
            const endHour = event.end.getHours();
            earliestStartHour = Math.min(earliestStartHour, startHour);
            latestEndHour = Math.max(latestEndHour, endHour);
        });

        // Sets the calender hours to the earliest start and latest end hour that was found if there are events
        if (earliestStartHour !== Infinity && latestEndHour !== -Infinity) {
            // Adds 1 hour to the earliest start hour and subtracts 1 hour from the latest end hour
            // This is done to make sure that the events are not displayed at the edge of the calendar
            earliestStartHour -= 1;
            latestEndHour += 1;

            setCalenderHours({
                startHour: earliestStartHour,
                endHour: latestEndHour
            });
        } 
    };

    // Function to set the height of the container
    const onLayout = (container: LayoutChangeEvent) => {
        const { height } = container.nativeEvent.layout;
        setContainerHeight(height);
    };

    // Function to calculate the overlap of events
    const calculateOverlaps = (eventsForDay: Event[]) => {
        // Sorts the events by start time
        const sortedEvents: Event[] = [...eventsForDay].sort((a, b) => a.start.getTime() - b.start.getTime());
        // Array to store the groups of overlapping events
        let overlapGroups: Event[][] = [];

        // Loops through the sorted events and groups them by overlapping events
        sortedEvents.forEach(event => {
            let addedToGroup = false;
            for (const group of overlapGroups) {
                const lastEventEnd = new Date(Math.max(...group.map(e => e.end.getTime())));
                if (event.start < lastEventEnd) {
                    group.push(event);
                    addedToGroup = true;
                    break;
                }
            }
            if (!addedToGroup) {
                overlapGroups.push([event]);
            }
        });

        // Loops through the groups and sets the overlap count and index for each event
        overlapGroups.forEach(group => {
            group.forEach((event, index) => {
                event.overlapCount = group.length;
                event.overlapIndex = index;
            });
        });
    };

    return (
        <View className='flex-1 flex-row w-full'>
            <Hours startHour={calenderHours.startHour} endHour={calenderHours.endHour} onHeightChange={setHoursContainerHeight} />
            <View className='flex-1 flex-row justify-between' onLayout={onLayout}>
                {Array.from({ length: 5 }).map((_, index) => {
                    const day = addDays(startOfWeekDate, index);
                    const eventsForDay = events.filter(event => isSameDay(event.start, day));
                    calculateOverlaps(eventsForDay);
                    const isCurrentDay = isToday(day);
                    const isPastDay = isPast(day);

                    return (
                        <View key={index} className='flex-1 items-center pt-2 border-l border-gray-200' style={{ zIndex: 10 }}>
                            <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                            <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                            {eventsForDay.map((event, eventIndex) => (
                                <Event key={eventIndex} event={event} containerHeight={containerHeight} hoursContainerHeight={hoursContainerHeight} calendar={calenderHours} overlapCount={event.overlapCount} overlapIndex={event.overlapIndex} />
                            ))}
                            <View className='absolute top-0 w-full h-full z-20' style={{ pointerEvents: 'none' }}>
                                {isPastDay && <PastMarker containerHeight={containerHeight} hoursContainerHeight={hoursContainerHeight} calendar={calenderHours} isToday={isCurrentDay} />}
                                {isCurrentDay && <TimeMarker containerHeight={containerHeight} hoursContainerHeight={hoursContainerHeight} calendar={calenderHours} />}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default Days;
