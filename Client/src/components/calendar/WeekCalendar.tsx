// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useCallback } from "react";
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
import {
  fetchEvents,
  loadEventsFromStorage,
} from "../../services/eventService";
import {
  getSelectedUniversity,
  getSelectedCourse,
} from "../../services/calendarService";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Days from "./Days";
import WeekSelector from "../selector/WeekSelector";
import { EventTimeProps } from "../../interfaces/calendarInterfaces";

// Important for LayoutAnimation on Android according to the docs
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
  const animateTransition = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  useFocusEffect(
    useCallback(() => {
      const loadEvents = async () => {
        setLoading(true);
        setProgress(0.3);
        await loadEventsFromStorage(setEvents);
        setProgress(0.6);
        await fetchEvents(setEvents);
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
                  navigation.navigate("OverviewStack", { screen: "Settings" });
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
