import React, { useState, useEffect, useCallback } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../provider/ThemeProvider";
import DefaultText from "../../components/textFields/DefaultText";
import Dropdown from "../../components/dropdown/Dropdown";
import { fetchEventsWithoutWait } from "../../services/EventService";
import {
  fetchCalendars,
  getSelectedUniversity,
  getSelectedCourse,
  fetchInitialHash,
} from "../../services/CalendarService";
import {
  EventTimeProps,
  CalendarProps,
} from "../../interfaces/CalendarInterfaces";

type SchemeType = "light" | "dark" | "system";

const Settings: React.FC = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [calendars, setCalendars] = useState<CalendarProps[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    name: string;
    uuid: string;
  } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [placeholderUniversity, setPlaceholderUniversity] = useState(
    "Select a University",
  );
  const [placeholderCourse, setPlaceholderCourse] = useState("Select a Course");
  const [events, setEvents] = useState<EventTimeProps[]>([]);
  const [missingUniversity, setMissingUniversity] = useState(false);
  const [missingCourse, setMissingCourse] = useState(false);

  const { theme, setTheme } = useTheme();

  const setScheme = (scheme: SchemeType) => {
    setTheme(scheme);
  };

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  useEffect(() => {
    fetchCalendars(setCalendars);
    getSelectedUniversity(
      setSelectedUniversity,
      setPlaceholderUniversity,
      setMissingUniversity,
    );
    getSelectedCourse(
      setSelectedCourse,
      setPlaceholderCourse,
      setMissingCourse,
    );
  }, []);

  const dropdownUniversityValues = calendars.map((calendar: any) => ({
    key: calendar.university_uuid,
    value: calendar.university_name,
  }));

  const handleUniversitySelect = async (selectedValue: string) => {
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
      setPlaceholderUniversity(selectedUni.university_name);
      setSelectedCourse(null);
      setPlaceholderCourse("Select a Course");
      fetchEventsWithoutWait(setEvents);
    }
  };

  const handleCourseSelect = async (selectedValue: string) => {
    setSelectedCourse(selectedValue);
    await AsyncStorage.setItem("selectedCourse", selectedValue);
    setPlaceholderCourse(selectedValue);
    const selectedUni = await AsyncStorage.getItem("selectedUniversity");
    if (selectedUni) {
      const { uuid } = JSON.parse(selectedUni);
      await fetchInitialHash(uuid, selectedValue);
    }
    fetchEventsWithoutWait(setEvents);
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
    ? calendars
      .find(
        (calendar) => calendar.university_uuid === selectedUniversity.uuid,
      )
      ?.course_names.map((course: string) => ({
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
