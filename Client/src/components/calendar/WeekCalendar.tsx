// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect, useCallback } from "react";
import { View, LayoutAnimation, UIManager, Platform } from "react-native";
import "nativewind";
import { addWeeks, subWeeks } from "date-fns";
import { FlingGestureHandler, Directions } from "react-native-gesture-handler";
import { axiosInstance } from "../../services/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Days from "./Days";
import WeekSelector from "../selector/WeekSelector";

interface Event {
  start: string | Date;
  end: string | Date;
  [key: string]: any;
}

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
  const [events, setEvents] = useState<Event[]>([]);

  // ====================================================== //
  // ===================== Animations ===================== //
  // ====================================================== //
  // Defines the animation for the transition between weeks (animation: easeInEaseOut)
  const animateTransition = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  //TODO Add loading spinner
  // Fetch events function with 15 minutes check and AsyncStorage usage
  const fetchEvents = async () => {
    try {
      const selectedUniversity = await AsyncStorage.getItem('selectedUniversity');
      const selectedCourse = await AsyncStorage.getItem('selectedCourse');
      const lastFetchTime = await AsyncStorage.getItem('lastFetchTime');
      const currentTime = new Date().getTime();

      if (lastFetchTime && currentTime - parseInt(lastFetchTime) < 15 * 60 * 1000) {
        console.log("Fetching data skipped, less than 15 minutes since last fetch");
        return;
      }

      if (selectedUniversity && selectedCourse) {
        const { uuid } = JSON.parse(selectedUniversity);
        const response = await axiosInstance.get(`/calendar/${uuid}/${selectedCourse}`);
        const data = response.data.data; 

        if (data && Array.isArray(data.events)) {
          const formattedEvents = data.events.map((event: Event) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
          }));

          setEvents(formattedEvents);
          await AsyncStorage.setItem('events', JSON.stringify(formattedEvents));
          await AsyncStorage.setItem('lastFetchTime', currentTime.toString());
        } else {
          console.error("Unexpected response format:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Load events from AsyncStorage
  const loadEventsFromStorage = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map((event: Event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setEvents(parsedEvents);
      }
    } catch (error) {
      console.error("Error loading events from storage:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEventsFromStorage();
      fetchEvents();
    }, [])
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
          <Days currentDate={currentDate} events={events} />
        </View>
      </FlingGestureHandler>
    </FlingGestureHandler>
  );
};

export default WeekCalendar;