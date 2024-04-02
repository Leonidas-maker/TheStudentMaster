import React, { useState, useEffect } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import 'nativewind';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

import Hours from './Hours';
import Event from './Event';

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
    const [containerHeight, setContainerHeight] = useState(0);
    const [hoursContainerHeight, setHoursContainerHeight] = useState(0);
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const calenderHours = { startHour: 8, endHour: 20 };

    const onLayout = (container: LayoutChangeEvent) => {
        const { height } = container.nativeEvent.layout;
        setContainerHeight(height);
    };

    const calculateOverlaps = (eventsForDay: Event[]) => {
        const sortedEvents: Event[] = [...eventsForDay].sort((a, b) => a.start.getTime() - b.start.getTime());
        let overlapGroups: Event[][] = [];
    
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

                    return (
                        <View key={index} className='flex-1 items-center pt-2 border-l border-gray-200'>
                            <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                            <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                            {eventsForDay.map((event, eventIndex) => (
                                <Event key={eventIndex} event={event} containerHeight={containerHeight} hoursContainerHeight={hoursContainerHeight} calendar={calenderHours} overlapCount={event.overlapCount} overlapIndex={event.overlapIndex} />
                            ))}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default Days;
