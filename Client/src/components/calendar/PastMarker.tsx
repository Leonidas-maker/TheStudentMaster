// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View } from "react-native";
import "nativewind";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import {
  calculateMarkerPositionFilled,
  calculateDayHeight,
} from "./CalendarCalculations";

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface PastMarkerProps {
  hoursContainerHeight: number;
  containerHeight: number;
  calendar: {
    startHour: number;
    endHour: number;
  };
  isToday: boolean;
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const PastMarker: React.FC<PastMarkerProps> = ({
  hoursContainerHeight,
  containerHeight,
  calendar,
  isToday,
}) => {
  // ====================================================== //
  // =============== PastMarker calculations ============== //
  // ====================================================== //
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

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="absolute w-full">
      {!isToday && (
        <View
          className="bg-gray-400 opacity-30"
          style={{
            position: "absolute",
            top: dayHeight,
            width: "100%",
            height: pastHeight,
          }}
        ></View>
      )}
      {isToday && (
        <View
          className="bg-gray-400 opacity-30"
          style={{
            position: "absolute",
            top: dayHeight,
            width: "100%",
            height: markerPositionFilled,
          }}
        ></View>
      )}
    </View>
  );
};

export default PastMarker;
