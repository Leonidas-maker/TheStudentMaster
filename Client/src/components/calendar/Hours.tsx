import React from "react";
import { View, Text } from "react-native";
import "nativewind";

//* Prop startHour expects an integer between 0 and 24 (optional - default: 8)
//* Prop endHour expects an integer between 0 and 24, endHour has to be greater than startHour (optional - default: 19)

interface HoursProps {
  startHour?: number;
  endHour?: number;
}

const Hours: React.FC<HoursProps> = ({ startHour = 8, endHour = 19 }) => {
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
    throw new Error("startHour and endHour must be an integer.");
  }
  if (startHour < 0 || startHour > 24 || endHour < 0 || endHour > 24) {
    throw new Error("startHour and endHour must be between 0 and 24.");
  }
  if (endHour <= startHour) {
    throw new Error("endHour must be greater than startHour.");
  }

  const hoursReal = endHour - startHour - 1;
  const newStart = startHour + 1;
  const hours = Array.from({ length: hoursReal }, (_, i) => newStart + i);

  return (
    <View className='w-14'>
      <View className="items-center p-2 border-gray-200">
        <Text className="text-lg text-primary">-</Text>
        <Text className="text-sm text-primary">-</Text>
      </View>
      <View className="flex-1 flex-col justify-between h-full">
        <View className="border-t border-gray-200 justify-top">
          <Text className="text-xs text-center text-white">{`${startHour}:00`}</Text>
        </View>
        {hours.map((hour) => (
          <View key={hour} className="border-t border-gray-200 justify-top">
            <Text className="text-xs text-center text-white">{`${hour}:00`}</Text>
          </View>
        ))}
        <View className="border-t border-gray-200 justify-top">
          <Text className="text-xs text-center text-white">{`${endHour}:00`}</Text>
        </View>
        <View/>
      </View>
    </View>
  );
};

export default Hours;
