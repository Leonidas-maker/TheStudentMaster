// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  Platform,
  Pressable,
  useColorScheme,
} from "react-native";
import "nativewind";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import {
  calculateEventHeight,
  calculateTopPosition,
  calculateLeftPosition,
  calculateEventWidth,
} from "./CalendarCalculations";
import DefaultButton from "../buttons/DefaultButton";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { EventProps } from "../../interfaces/calendarInterfaces";

//TODO Implement a function to choose in settings if the start and end time should be displayed
//TODO Implement a function to choose in settings if the location should be displayed
//TODO Implement all day events
// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Event: React.FC<EventProps> = ({
  event,
  hoursContainerHeight,
  containerHeight,
  calendar,
  overlapCount = 1,
  overlapIndex = 0,
  isSaturday,
}) => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [modalVisible, setModalVisible] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // Checks if the platform is web
  useEffect(() => {
    if (Platform.OS === "web") {
      setIsWeb(true);
    } else {
      setIsWeb(false);
    }
  }, []);

  // ====================================================== //
  // ================= Event calculations ================= //
  // ====================================================== //
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

  // ====================================================== //
  // ================ Press event handlers ================ //
  // ====================================================== //
  // Handles the event press and sets the modal visible
  const handleEventPress = () => {
    setModalVisible(true);
  };

  // Handles the close press and sets the modal invisible
  const handleClosePress = () => {
    setModalVisible(false);
  };

  // ====================================================== //
  // ================ Better event display ================ //
  // ====================================================== //
  // Formats the start and end time of the event
  const startTimeString = event.start.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTimeString = event.end.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Constants for the displayed event informations
  const MIN_EVENT_HEIGHT_TIME = 100;
  const MIN_EVENT_HEIGHT_LOCATION = 110;
  const MAX_EVENT_SUMMARY_LENGTH = 25;

  // Truncates the text if it is longer than the max length
  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength
      ? text.substring(0, maxLength - 3) + "..."
      : text;
  };

  // Gets the color for the event based on the event type
  // TODO Implement more colors for different event types
  const getEventColor = () => {
    if (isLight) {
      if (event.description?.tags) {
        if (event.description.tags.includes("exam")) {
          return "bg-light_exam active:bg-light_exam_active";
        } else if (event.description.tags.includes("online")) {
          return "bg-light_online active:bg-light_online_active";
        }
      }
      return "bg-light_event active:bg-light_event_active";
    } else {
      if (event.description?.tags) {
        if (event.description.tags.includes("exam")) {
          return "bg-dark_exam active:bg-dark_exam_active";
        } else if (event.description.tags.includes("online")) {
          return "bg-dark_online active:bg-dark_online_active";
        }
      }
      return "bg-dark_event active:bg-dark_event_active";
    }
  };

  //TODO Better styling for event popup information
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="absolute w-full">
      <Pressable
        onPress={handleEventPress}
        className={`rounded-lg shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px] ${getEventColor()}`}
        style={{
          position: "absolute",
          top: topPosition,
          left: `${leftPosition}%`,
          width: `${eventWidth}%`,
          height: eventHeight,
        }}
      >
        <Text className="text-white pt-2 px-1 text-sm font-bold">
          {truncateText(event.summary, MAX_EVENT_SUMMARY_LENGTH)}
        </Text>
        {eventHeight > MIN_EVENT_HEIGHT_TIME &&
          overlapCount === 1 &&
          overlapIndex === 0 && (
            <>
              <Text className="text-white px-1 text-xs py-2">{`${startTimeString} - ${endTimeString}`}</Text>
            </>
          )}
        {eventHeight > MIN_EVENT_HEIGHT_LOCATION &&
          overlapCount === 1 &&
          overlapIndex === 0 &&
          !isSaturday && (
            <>
              <Text className="text-white px-1 text-xs absolute bottom-1">
                {event.location}
              </Text>
            </>
          )}
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <Pressable
          className="flex-1 justify-center items-center"
          onPressOut={handleClosePress}
        >
          <View
            className="bg-light_secondary dark:bg-dark_secondary p-5 rounded-2xl items-center shadow-md"
            onStartShouldSetResponder={() => true}
          >
            <Text className="item-center pb-3 text-black dark:text-white">
              {event.summary}
            </Text>
            <Text className="item-center font-bold text-black dark:text-white">{`Startzeit: ${startTimeString}`}</Text>
            <Text className="item-center font-bold text-black dark:text-white">{`Endzeit: ${endTimeString}`}</Text>
            <Text className="item-center font-bold text-black dark:text-white">{`Ort: ${event.location}`}</Text>
            {isWeb && (
              <>
                <DefaultButton text="Schließen" />
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Event;
