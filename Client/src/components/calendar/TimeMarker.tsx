// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from 'react';
import { View } from 'react-native';
import 'nativewind';

// ~~~~~~~~ Own components imports ~~~~~~~ //
import { calculateMarkerPosition } from './CalendarCalculations';

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface TimeMarkerProps {
    hoursContainerHeight: number;
    containerHeight: number;
    calendar: {
        startHour: number;
        endHour: number;
    }
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const TimeMarker: React.FC<TimeMarkerProps> = ({ hoursContainerHeight, containerHeight, calendar }) => {
    // ====================================================== //
    // =============== TimeMarker calculations ============== //
    // ====================================================== //
    // Gets the Marker Position
    const markerPosition = calculateMarkerPosition({
        startHour: calendar.startHour,
        endHour: calendar.endHour,
        hoursContainerHeight: hoursContainerHeight,
        containerHeight: containerHeight,
    });

    // ====================================================== //
    // ================== Return component ================== //
    // ====================================================== //
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
