// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from "react-native";
import "nativewind";
import { addWeeks, subWeeks } from "date-fns";
import { FlingGestureHandler, Directions } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import {
  fetchEvents,
  loadEventsFromStorage,
} from "../../services/eventService";
import {
  getSelectedUniversity,
  getSelectedCourse,
  fetchCalendars,
} from "../../services/calendarService";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Days from "./Days";
import WeekSelector from "../selector/WeekSelector";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import {
  CalendarProps,
  EventTimeProps,
} from "../../interfaces/calendarInterfaces";

// Important for LayoutAnimation on Android according to the docs
//! Disabled because it causes a crash on Android
// if (Platform.OS === "android") {
//   if (UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
//   }
// }

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const WeekCalendar: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  // Gets the current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<EventTimeProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [calendars, setCalendars] = useState<CalendarProps[]>([]);
  const navigation = useNavigation<any>();

  // ====================================================== //
  // ===================== Animations ===================== //
  // ====================================================== //
  // Defines the animation for the transition between weeks (animation: easeInEaseOut)
  //! Disabled animation on Android because it causes a crash
  const animateTransition = () => {
    if (Platform.OS === "android") {
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadEvents = async () => {
        setLoading(true);
        setProgress(0.3);
        await loadEventsFromStorage(setEvents);
        setProgress(0.6);
        // Function to try fetching the new uuid
        // If it does not work, user has to select a new university
        try {
          await fetchEvents(setEvents);
        } catch (error) {
          console.error("Error fetching events", error);

          try {
            await fetchCalendars(setCalendars);

            const currentCalendar =
              await AsyncStorage.getItem("selectedUniversity");

            if (currentCalendar) {
              const calendarObject = JSON.parse(currentCalendar);
              const selectedUniversityName = calendarObject.name;

              const matchingCalendar = calendars.find(
                (calendar) =>
                  calendar.university_name === selectedUniversityName,
              );

              if (matchingCalendar) {
                const newSelectedUniversity = {
                  name: selectedUniversityName,
                  uuid: matchingCalendar.university_uuid,
                };

                await AsyncStorage.setItem(
                  "selectedUniversity",
                  JSON.stringify(newSelectedUniversity),
                );

                loadEvents();
              } else {
                throw new Error("No matching calendar found.");
              }
            } else {
              throw new Error("No selected university found.");
            }
          } catch (error) {
            console.error("Error setting uuid new", error);

            await AsyncStorage.removeItem("selectedUniversity");
            await AsyncStorage.removeItem("selectedCourse");
          }
        }
        setProgress(1);
        setLoading(false);
      };

      const checkSelections = async () => {
        let missingUniversity = false;
        let missingCourse = false;

        await getSelectedUniversity(
          () => {},
          () => {},
          (missing) => {
            missingUniversity = missing;
          },
        );
        await getSelectedCourse(
          () => {},
          () => {},
          (missing) => {
            missingCourse = missing;
          },
        );

        if (missingUniversity || missingCourse) {
          Alert.alert(
            "Auswahl erforderlich",
            "Bitte wählen Sie eine Universität und einen Kurs aus.",
            [
              {
                text: "Zurück",
                style: "cancel",
              },
              {
                text: "Zur Auswahl",
                onPress: () => {
                  navigation.navigate("MiscStack", { screen: "Settings" });
                },
                style: "default",
              },
            ],
            { cancelable: false },
          );
        }
      };

      loadEvents();
      checkSelections();
    }, [navigation]),
  );

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  // Handles the back press by subtracting a week from the current displayed date
  const handleBackPress = () => {
    animateTransition();
    setCurrentDate((current) => subWeeks(current, 1));
  };

  // Handles the forward press by adding a week to the current displayed date
  const handleForwardPress = () => {
    animateTransition();
    setCurrentDate((current) => addWeeks(current, 1));
  };

  // Handles the today press by setting the current displayed date to the current date
  const handleTodayPress = () => {
    animateTransition();
    setCurrentDate(new Date());
  };

  //TODO Add scrolling in web version
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  // nativeEvent.state === 5 is the end of the gesture
  return (
    <FlingGestureHandler
      direction={Directions.LEFT}
      onHandlerStateChange={({ nativeEvent }) => {
        if (nativeEvent.state === 5) handleForwardPress();
      }}
    >
      <FlingGestureHandler
        direction={Directions.RIGHT}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 5) handleBackPress();
        }}
      >
        <View className="h-full flex-1">
          <WeekSelector
            mode="calendar"
            onBackPress={handleBackPress}
            onForwardPress={handleForwardPress}
            onTodayPress={handleTodayPress}
          />
          {loading && <Progress.Bar progress={progress} width={null} />}
          <Days currentDate={currentDate} events={events} />
        </View>
      </FlingGestureHandler>
    </FlingGestureHandler>
  );
};

export default WeekCalendar;
