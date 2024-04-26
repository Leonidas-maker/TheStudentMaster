// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, addDays } from 'date-fns';

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface DayViewProps {
    setSelectedDate: (date: Date) => void;
    startOfWeekDate: Date;
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DayView: React.FC<DayViewProps> = ({
    setSelectedDate,
    startOfWeekDate
}) => {
    // ====================================================== //
    // ================== Return component ================== //
    // ====================================================== //
    return (
        <View className='flex-row py-3'>
            {Array.from({ length: 5 }).map((_, index) => {
                const day = addDays(startOfWeekDate, index);
                const isFirstDay = index === 0;

                return (
                    <View className="flex-1">
                        {isFirstDay ?
                            <TouchableOpacity key={index} className="items-center pt-2 z-10" onPress={() => setSelectedDate(day)}>
                                <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                                <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity key={index} className="items-center pt-2 border-l border-gray-200 z-10" onPress={() => setSelectedDate(day)}>
                                <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                                <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                            </TouchableOpacity>
                        }
                    </View>
                );
            })}
        </View>
    );
};

export default DayView;
