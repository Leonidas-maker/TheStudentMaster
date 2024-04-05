import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import 'nativewind';

import { calculateEventHeight, calculateTopPosition, calculateLeftPosition, calculateEventWidth } from './CalendarCalculations';

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
//TODO Implement a function to choose in settings if the start and end time should be displayed
//TODO Implement a function to choose in settings if the location should be displayed
//TODO Implement all day events
const Event: React.FC<EventProps> = ({ event, hoursContainerHeight, containerHeight, calendar, overlapCount = 1, overlapIndex = 0 }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const [isWeb, setIsWeb] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            setIsWeb(true);
        } else {
            setIsWeb(false);
        };
    }, []);

    // Gets the Event Height
    const eventHeight = calculateEventHeight({
        start: event.start,
        end: event.end,
        startHour: calendar.startHour,
        endHour: calendar.endHour,
        hoursContainerHeight: hoursContainerHeight,
    });

    // Gets the Top Position
    const topPosition = calculateTopPosition({
        start: event.start,
        startHour: calendar.startHour,
        endHour: calendar.endHour,
        hoursContainerHeight: hoursContainerHeight,
        containerHeight: containerHeight,
    });

    // Gets the Left Position
    const leftPosition = calculateLeftPosition({
        overlapCount: overlapCount,
        overlapIndex: overlapIndex,
    });

    // Gets the Event Width
    const eventWidth = calculateEventWidth(overlapCount);

    // Handles the event press and sets the modal visible
    const handleEventPress = () => {
        setModalVisible(true);
    };

    // Handles the close press and sets the modal invisible
    const handleClosePress = () => {
        setModalVisible(false);
    };

    // Formats the start and end time of the event 
    const startTimeString = event.start.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const endTimeString = event.end.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    // Constants for the displayed event informations
    const MIN_EVENT_HEIGHT_TIME = 95;
    const MIN_EVENT_HEIGHT_LOCATION = 80;
    const MAX_EVENT_SUMMARY_LENGTH = 25;

    // Truncates the text if it is longer than the max length
    const truncateText = (text: string, maxLength: number): string => {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
    };

    //TODO Better styling for event popup information
    return (
        <View className='absolute w-full'>
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
                <Text className='text-white pt-2 px-1 text-sm font-bold'>{truncateText(event.summary, MAX_EVENT_SUMMARY_LENGTH)}</Text>
                {eventHeight > MIN_EVENT_HEIGHT_TIME && overlapCount === 1 && overlapIndex === 0 && (
                    <>
                        <Text className='text-white px-1 text-xs py-2'>{`${startTimeString} - ${endTimeString}`}</Text>
                    </>
                )}
                {eventHeight > MIN_EVENT_HEIGHT_LOCATION && overlapCount === 1 && overlapIndex === 0 && (
                    <>
                        <Text className='text-white px-1 text-xs absolute bottom-1'>{event.location}</Text>
                    </>
                )}
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <TouchableOpacity
                    className='flex-1 justify-center items-center'
                    activeOpacity={1}
                    onPressOut={handleClosePress}>
                    <View className='bg-white p-5 rounded-2xl items-center shadow-md' onStartShouldSetResponder={() => true}>
                        <Text className='item-center pb-3'>{event.summary}</Text>
                        <Text className='item-center font-bold'>{`Startzeit: ${startTimeString}`}</Text>
                        <Text className='item-center font-bold'>{`Endzeit: ${endTimeString}`}</Text>
                        <Text className='item-center font-bold'>{`Ort: ${event.location}`}</Text>
                        {isWeb &&
                            <>
                                <View className='pt-3'>
                                    <TouchableOpacity
                                        className='bg-blue-500 rounded-3xl p-3'
                                        onPress={handleClosePress}>
                                        <Text className='text-white font-bold items-center'>Schließen</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        }
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default Event;
