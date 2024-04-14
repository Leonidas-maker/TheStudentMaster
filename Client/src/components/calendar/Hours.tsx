// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import "nativewind";

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface HoursProps {
  startHour: number;
  endHour: number;
  onHeightChange: (height: number) => void;
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Hours: React.FC<HoursProps> = ({ startHour, endHour, onHeightChange }) => {
  // Function to set the height of the hours container
  const onLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (onHeightChange) {
      onHeightChange(height);
    }
  };

  // ====================================================== //
  // ================== Hour calculations ================= //
  // ====================================================== //
  // Calculates the total hours displayed in the calender
  const hoursCount = endHour - startHour - 2;

  // Calculates the new start and end hours 
  // Needed for the hours array because the first and last hour are displayed differently
  const newStart = startHour + 1;
  const newEnd = endHour - 1;

  // Creates an array with the hours between startHour and endHour
  const hours = Array.from({ length: hoursCount }, (_, i) => newStart + i);

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
