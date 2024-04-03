import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
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
    const [modalVisible, setModalVisible] = useState(false);

    const [isWeb, setIsWeb] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'web') {
            setIsWeb(true);
        } else {
            setIsWeb(false);
        };
    }, []);

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
        setModalVisible(true);
    };

    // Calculates the width based on how many events take place at the same time
    const eventWidth = 100 / overlapCount;
    // Calculates the left position based on how many events take place at the same time
    const leftPosition = ((100 / overlapCount) * overlapIndex);

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
                <Text className='text-white pt-2 px-2 text-sm'>{event.summary}</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}>
                <View className='flex-1 justify-center items-center m-10'>
                    <View className='bg-white p-5 rounded-2xl items-center shadow-md'>
                        <Text className='item-center'>{event.summary}</Text>
                        {isWeb &&
                            <View className='pt-3'>
                                <TouchableOpacity
                                    className='bg-blue-500 rounded-3xl p-3'
                                    onPress={() => setModalVisible(!modalVisible)}>
                                    <Text className='text-white font-bold items-center'>Schließen</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Event;
