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
import axios, { AxiosError } from "axios";

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
          const fetchedEvents = await fetchEvents();

          if (fetchedEvents.length > 0) {
            setEvents(fetchedEvents);
          } else {
            setProgress(1);
            setLoading(false);
            return;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status !== 404 && error.response?.status !== 422) {	
              throw new Error("Error fetching events");
            }
            try {
              const fetchedCalendars = await fetchCalendars();
              const currentCalendar = await AsyncStorage.getItem(
                "selectedUniversity"
              );

              if (fetchedCalendars.length > 0 && currentCalendar) {
                const calendarObject = JSON.parse(currentCalendar);
                const selectedUniversityName = calendarObject.name;
                const matchingCalendar = fetchedCalendars.find(
                  (calendar) =>
                    calendar.university_name === selectedUniversityName
                );

                if (matchingCalendar) {
                  const newSelectedUniversity = {
                    name: selectedUniversityName,
                    uuid: matchingCalendar.university_uuid,
                  };
                  await AsyncStorage.setItem(
                    "selectedUniversity",
                    JSON.stringify(newSelectedUniversity)
                  );

                  const fetchedEvents = await fetchEvents(true);

                  if (fetchedEvents.length > 0) {
                    setEvents(fetchedEvents);
                  } else {
                    throw new Error("Error fetching events");
                  }
                } else {
                  throw new Error("No calendars found.");
                }
              } else {
                throw new Error("No selected university found.");
              }
            } catch (error) {
              console.error("Error setting uuid new", error);

              await AsyncStorage.removeItem("selectedUniversity");
              await AsyncStorage.removeItem("selectedCourse");
              await AsyncStorage.removeItem("events");
              
              Alert.alert(
                "Calendar nicht verfügbar",
                "Der gewählte Kalender ist nicht verfügbar. Bitte wählen Sie einen neuen Kalender aus.",
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
                { cancelable: false }
              );
            }
          } else {
            console.error("Error fetching events", error);
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
          }
        );
        await getSelectedCourse(
          () => {},
          () => {},
          (missing) => {
            missingCourse = missing;
          }
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
            { cancelable: false }
          );
        }
      };

      loadEvents();
      checkSelections();
    }, [navigation])
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
