import React, { useState, useEffect, useCallback } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from "nativewind";
import { useTheme } from "../../provider/ThemeProvider";
import DefaultText from "../../components/textFields/DefaultText";
import Dropdown from "../../components/dropdown/Dropdown";
import { axiosInstance } from "../../services/api";
import { useFocusEffect } from '@react-navigation/native';

type SchemeType = "light" | "dark" | "system";

interface Calendar {
  university_name: string;
  university_uuid: string;
  course_names: string[];
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
}

const Settings: React.FC = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<{ name: string; uuid: string } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [placeholderUniversity, setPlaceholderUniversity] = useState("Select a University");
  const [placeholderCourse, setPlaceholderCourse] = useState("Select a Course");
  const [events, setEvents] = useState<Event[]>([]);

  const { theme, setTheme } = useTheme();

  const setScheme = (scheme: SchemeType) => {
    setTheme(scheme);
  };

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const response = await axiosInstance.get("/calendar/available_calendars");
        setCalendars(response.data);
      } catch (err) {
        console.log("Failed to load calendars");
      }
    };

    const getSelectedData = async () => {
      try {
        const storedUniversity = await AsyncStorage.getItem('selectedUniversity');
        if (storedUniversity) {
          const parsedUniversity = JSON.parse(storedUniversity);
          setSelectedUniversity(parsedUniversity);
          setPlaceholderUniversity(parsedUniversity.name);
        }

        const storedCourse = await AsyncStorage.getItem('selectedCourse');
        if (storedCourse) {
          setSelectedCourse(storedCourse);
          setPlaceholderCourse(storedCourse);
        }
      } catch (err) {
        console.log("Failed to load selected data from storage");
      }
    };

    fetchCalendars();
    getSelectedData();
  }, []);

  //TODO Make own service for fetching events
  const fetchEvents = async () => {
    try {
      const selectedUniversity = await AsyncStorage.getItem('selectedUniversity');
      const selectedCourse = await AsyncStorage.getItem('selectedCourse');
      const currentTime = new Date().getTime();

      if (selectedUniversity && selectedCourse) {
        const { uuid } = JSON.parse(selectedUniversity);
        const response = await axiosInstance.get(`/calendar/${uuid}/${selectedCourse}`);
        const data = response.data.data; 

        if (data && Array.isArray(data.events)) {
          const formattedEvents = data.events.map((event: any) => ({
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

  const loadEventsFromStorage = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem('events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
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

  useEffect(() => {
    if (selectedUniversity && selectedCourse) {
      fetchEvents();
    }
  }, [selectedUniversity, selectedCourse]);

  const dropdownUniversityValues = calendars.map((calendar: any) => ({
    key: calendar.university_uuid,
    value: calendar.university_name,
  }));

  const handleUniversitySelect = async (selectedValue: string) => {
    const selectedUni = calendars.find(calendar => calendar.university_name === selectedValue);
    if (selectedUni) {
      const selectedUniData = { name: selectedUni.university_name, uuid: selectedUni.university_uuid };
      setSelectedUniversity(selectedUniData);
      await AsyncStorage.setItem('selectedUniversity', JSON.stringify(selectedUniData));
      setPlaceholderUniversity(selectedUni.university_name);
      setSelectedCourse(null);
      setPlaceholderCourse("Select a Course");
      fetchEvents(); // Fetch events when university changes
    }
  };

  const handleCourseSelect = async (selectedValue: string) => {
    setSelectedCourse(selectedValue);
    await AsyncStorage.setItem('selectedCourse', selectedValue);
    setPlaceholderCourse(selectedValue);
    fetchEvents(); // Fetch events when course changes
  };

  const RadioOption = ({
    label,
    onPress,
    checked,
  }: {
    label: string;
    onPress: () => void;
    checked: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
      }}
      className="active:opacity-50"
    >
      <View
        style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: "#fff",
            }}
          />
        ) : null}
      </View>
      <View className="m-3">
        <DefaultText text={label} />
      </View>
    </Pressable>
  );

  const courseDropdownValues = selectedUniversity
    ? calendars.find(calendar => calendar.university_uuid === selectedUniversity.uuid)?.course_names.map((course: string) => ({
        key: course,
        value: course,
      })) || []
    : [];

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="p-4">
        <DefaultText text="Welcome to the Settings page" />
        <Dropdown
          setSelected={handleUniversitySelect}
          values={dropdownUniversityValues}
          placeholder={placeholderUniversity}
        />
        {selectedUniversity && (
          <Dropdown
            setSelected={handleCourseSelect}
            values={courseDropdownValues}
            placeholder={placeholderCourse}
            search={true}
          />
        )}
        <RadioOption
          label="Light Mode"
          onPress={() => setScheme("light")}
          checked={theme === "light"}
        />
        <RadioOption
          label="Dark Mode"
          onPress={() => setScheme("dark")}
          checked={theme === "dark"}
        />
        <RadioOption
          label="System Mode"
          onPress={() => setScheme("system")}
          checked={theme === "system"}
        />
      </View>
    </ScrollView>
  );
};

export default Settings;