import React, { useState } from 'react';
import { View, Text } from 'react-native';
import 'nativewind';
import { format, startOfWeek, addDays } from 'date-fns';

const Days: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 });

    return (
        <View className='flex-row'>
            <View className='w-16' />
            {Array.from({ length: 6 }).map((_, index) => {
                const day = addDays(startOfWeekDate, index);
                return (
                    <View key={index} className='flex-1 items-center p-2 border-l border-gray-200'>
                        <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                        <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                    </View>
                );
            })}
        </View>
    );
};

export default Days;