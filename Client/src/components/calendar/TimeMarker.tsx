import React from 'react';
import { View } from 'react-native';
import 'nativewind';

import { calculateMarkerPosition } from './CalendarCalculations';

interface EventProps {
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    },
    overlapCount?: number;
    overlapIndex?: number;
}

const TimeMarker: React.FC<EventProps> = ({ hoursContainerHeight, containerHeight, calendar }) => {
    // Gets the Marker Position
    const markerPosition = calculateMarkerPosition({
        startHour: calendar.startHour,
        endHour: calendar.endHour,
        hoursContainerHeight: hoursContainerHeight,
        containerHeight: containerHeight,
    });

    return (
        <View className='absolute w-full'>
            
            <View
                className='bg-red-500 rounded-lg shadow-sm'
                style={{
                    position: 'absolute',
                    top: markerPosition,
                    width: '100%',
                    height: 2,
                }}>
            </View>
        </View>
    );
};

export default TimeMarker;
