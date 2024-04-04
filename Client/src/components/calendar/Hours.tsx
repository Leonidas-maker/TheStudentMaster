import React from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import "nativewind";

//* Prop startHour expects an integer between 0 and 24 (optional - default: 8)
//* Prop endHour expects an integer between 0 and 24, endHour has to be greater than startHour (optional - default: 19)

interface HoursProps {
  startHour?: number;
  endHour?: number;
  onHeightChange?: (height: number) => void;
}

const Hours: React.FC<HoursProps> = ({ startHour = 8, endHour = 19, onHeightChange }) => {
  // Checks if startHour and endHour are integers
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
    throw new Error("startHour and endHour must be an integer.");
  }
  // Checks if startHour and endHour are between 0 and 24
  if (startHour < 0 || startHour > 24 || endHour < 0 || endHour > 24) {
    throw new Error("startHour and endHour must be between 0 and 24.");
  }
  // Checks if endHours is greater than startHour
  if (endHour <= startHour) {
    throw new Error("endHour must be greater than startHour.");
  }

  // Function to set the height of the hours container
  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if(onHeightChange) {
      onHeightChange(height);
    }
  };

  // Calculates the total hours displayed in the calender
  const hoursCount = endHour - startHour - 2;
  // Calculates the new start and end hours 
  // Needed for the hours array because the first and last hour are displayed differently
  const newStart = startHour + 1;
  const newEnd = endHour - 1;
  // Creates an array with the hours between startHour and endHour
  const hours = Array.from({ length: hoursCount }, (_, i) => newStart + i);

  return (
    <View className='w-14'>
      <View className="items-center p-2 border-gray-200">
        <Text className="text-lg text-primary">-</Text>
        <Text className="text-sm text-primary">-</Text>
      </View>
      <View className="flex-1 flex-col justify-between h-full" onLayout={onLayout}>
        <View className="border-t border-gray-200 justify-top">
          <Text className="text-xs text-center text-white">{`${startHour}:00`}</Text>
        </View>
        {hours.map((hour) => (
          <View key={hour} className="border-t border-gray-200 justify-top">
            <Text className="text-xs text-center text-white">{`${hour}:00`}</Text>
          </View>
        ))}
        <View className="border-t border-gray-200 justify-top">
          <Text className="text-xs text-center text-white">{`${newEnd}:00`}</Text>
        </View>
        <View />
      </View>
    </View>
  );
};

export default Hours;
