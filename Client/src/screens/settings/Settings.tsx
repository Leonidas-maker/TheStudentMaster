// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import * as Progress from "react-native-progress";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import { useTheme } from "../../provider/ThemeProvider";
import DefaultText from "../../components/textFields/DefaultText";
import Dropdown from "../../components/dropdown/Dropdown";
import Subheading from "../../components/textFields/Subheading";
import RadioOption from "../../components/radioOption/RadioOption";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import { fetchEventsWithoutWait } from "../../services/eventService";
import {
  fetchCalendars,
  getSelectedUniversity,
  getSelectedCourse,
  fetchInitialHash,
} from "../../services/calendarService";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import {
  EventTimeProps,
  CalendarProps,
} from "../../interfaces/calendarInterfaces";
import { set } from "lodash";

// ~~~~~~~~~~~~~~~~ Types ~~~~~~~~~~~~~~~~ //
type SchemeType = "light" | "dark" | "system";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Settings: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [calendars, setCalendars] = useState<CalendarProps[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    name: string;
    uuid: string;
  } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [placeholderUniversity, setPlaceholderUniversity] =
    useState("Uni auswählen");
  const [placeholderCourse, setPlaceholderCourse] = useState("Kurs auswählen");
  const [events, setEvents] = useState<EventTimeProps[]>([]);
  const [missingUniversity, setMissingUniversity] = useState(false);
  const [missingCourse, setMissingCourse] = useState(false);
  const [isLight, setIsLight] = useState(false);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  let activateCallback = false;

  // ~~~~~~~~~~~~~~~~ Theme ~~~~~~~~~~~~~~~~ //
  // Get the theme and set the theme
  const { theme, setTheme } = useTheme();

  // Set the scheme
  const setScheme = (scheme: SchemeType) => {
    setTheme(scheme);
  };

  // ~~~~~~~~~~~~~~ Use Color Scheme ~~~~~~~~~~~~~~ //
  const { colorScheme, setColorScheme } = useColorScheme();

  // Set the color scheme
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  // Set if the theme is light or dark
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // Color based on the theme
  const radioColor = isLight ? "#171717" : "#E0E2DB";

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  useEffect(() => {
    const fetchData = async () => {
      activateCallback = false;
      setLoading(true);
      setProgress(0.25);
      const availableCalendars = await fetchCalendars();
      if (availableCalendars.length > 0) {
        setCalendars(availableCalendars);
      }

      setProgress(0.5);
      await getSelectedUniversity(
        setSelectedUniversity,
        setPlaceholderUniversity,
        setMissingUniversity,
      );
      setProgress(0.75);
      await getSelectedCourse(
        setSelectedCourse,
        setPlaceholderCourse,
        setMissingCourse,
      );

      setProgress(1);
      setLoading(false);
      activateCallback = true;
    };
    fetchData();
  }, []);

  // ====================================================== //
  // ===================== Functions ====================== //
  // ====================================================== //
  // Dropdown values for the university
  const dropdownUniversityValues = calendars.map((calendar: any) => ({
    key: calendar.university_uuid,
    value: calendar.university_name,
  }));

  // Handle the university select and gets data from backend
  // Sets progress and loading state
  const handleUniversitySelect = async (selectedValue: string) => {
    if (!activateCallback) return;
    const selectedUni = calendars.find(
      (calendar) => calendar.university_name === selectedValue,
    );
    if (selectedUni) {
      const selectedUniData = {
        name: selectedUni.university_name,
        uuid: selectedUni.university_uuid,
      };
      setSelectedUniversity(selectedUniData);
      await AsyncStorage.setItem(
        "selectedUniversity",
        JSON.stringify(selectedUniData),
      );
      setSelectedCourse(null);
      setPlaceholderCourse("Select a Course");
    }
  };

  // Handle the course select and gets data from backend
  // Sets progress and loading state
  const handleCourseSelect = async (selectedValue: string) => {
    if (!activateCallback) return;
    setLoading(true);
    setProgress(0.25);
    setSelectedCourse(selectedValue);
    await AsyncStorage.setItem("selectedCourse", selectedValue);
    setProgress(0.5);
    const selectedUni = await AsyncStorage.getItem("selectedUniversity");
    if (selectedUni) {
      const { uuid } = JSON.parse(selectedUni);
      await fetchInitialHash(uuid, selectedValue);
    }
    setProgress(0.75);
    await fetchEventsWithoutWait(setEvents);
    setProgress(1);
    setLoading(false);
  };

  // Dropdown values for the courses
  // Based on the selected university
  const courseDropdownValues = useMemo(() => {
    return selectedUniversity
      ? calendars
          .find(
            (calendar) => calendar.university_uuid === selectedUniversity.uuid,
          )
          ?.course_names.map((course: string) => ({
            key: course,
            value: course,
          })) || []
      : [];
  }, [selectedUniversity, calendars]);

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      {loading && <Progress.Bar progress={progress} width={null} />}
      <View className="p-4">
        <Subheading text="Kurs auswählen" />
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
        <Subheading text="Design auswählen" />
        <RadioOption
          label="Light Mode"
          onPress={() => setScheme("light")}
          checked={theme === "light"}
          radioColor={radioColor}
        />
        <RadioOption
          label="Dark Mode"
          onPress={() => setScheme("dark")}
          checked={theme === "dark"}
          radioColor={radioColor}
        />
        <RadioOption
          label="System Mode"
          onPress={() => setScheme("system")}
          checked={theme === "system"}
          radioColor={radioColor}
        />
      </View>
    </ScrollView>
  );
};

export default Settings;
