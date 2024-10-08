// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import "nativewind";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import {
  calculateMarkerPosition,
  calculateDayHeight,
} from "./CalendarCalculations";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { TimeMarkerProps } from "../../interfaces/calendarInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const TimeMarker: React.FC<TimeMarkerProps> = ({
  hoursContainerHeight,
  containerHeight,
  calendar,
}) => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [showTimeMarker, setShowTimeMarker] = useState(true);

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

  // Gets the Day Height
  const dayHeight = calculateDayHeight(containerHeight, hoursContainerHeight);

  // Sets the showTimeMarker state to false if the markerPosition is less than the dayHeight and should not be shown
  useEffect(() => {
    if (markerPosition < dayHeight) {
      setShowTimeMarker(false);
    } else {
      setShowTimeMarker(true);
    }
  }, [markerPosition, dayHeight]);

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="absolute w-full">
      {showTimeMarker && (
        <View
          className="bg-light_action dark:bg-dark_action rounded-lg shadow-sm"
          style={{
            position: "absolute",
            top: markerPosition,
            width: "100%",
            height: 2,
          }}
        ></View>
      )}
    </View>
  );
};

export default TimeMarker;
