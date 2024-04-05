import React from 'react';
import { View } from 'react-native';
import 'nativewind';

import { calculateMarkerPositionFilled, calculateDayHeight } from './CalendarCalculations';

interface EventProps {
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    },
    overlapCount?: number;
    overlapIndex?: number;
    isToday?: boolean;
}

const PastMarker: React.FC<EventProps> = ({ hoursContainerHeight, containerHeight, calendar, isToday = false }) => {
    // Gets the Day Height
    const dayHeight = calculateDayHeight(containerHeight, hoursContainerHeight);

    // Sets the Past Height as the Hours Container Height
    const pastHeight = hoursContainerHeight;

    // Gets the Height of the Marker
    const markerPositionFilled = calculateMarkerPositionFilled({
        startHour: calendar.startHour,
        endHour: calendar.endHour,
        hoursContainerHeight: hoursContainerHeight,
        containerHeight: containerHeight,
    });

    return (
        <View className='absolute w-full'>
            {!isToday &&
                <View
                    className='bg-gray-400 opacity-30'
                    style={{
                        position: 'absolute',
                        top: dayHeight,
                        width: '100%',
                        height: pastHeight,
                    }}>
                </View>
            }
            {isToday &&
                <View
                className='bg-gray-400 opacity-30'
                style={{
                    position: 'absolute',
                    top: dayHeight,
                    width: '100%',
                    height: markerPositionFilled,
                }}>
            </View>
            }
        </View>
    );
};

export default PastMarker;
