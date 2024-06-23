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
import Subheading from "../../components/textFields/Subheading";
import * as Progress from "react-native-progress";

type SchemeType = "light" | "dark" | "system";

const Settings: React.FC = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
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

  const { theme, setTheme } = useTheme();

  const setScheme = (scheme: SchemeType) => {
    setTheme(scheme);
  };

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const radioColor = isLight ? "#171717" : "#E0E2DB";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setProgress(0.25);
      await fetchCalendars(setCalendars);
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
    };

    fetchData();
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
      setLoading(true);
      setProgress(0.3);
      setSelectedUniversity(selectedUniData);
      await AsyncStorage.setItem(
        "selectedUniversity",
        JSON.stringify(selectedUniData),
      );
      setProgress(0.6);
      setPlaceholderUniversity(selectedUni.university_name);
      setSelectedCourse(null);
      setPlaceholderCourse("Select a Course");
      await fetchEventsWithoutWait(setEvents);
      setProgress(1);
      setLoading(false);
    }
  };

  const handleCourseSelect = async (selectedValue: string) => {
    setLoading(true);
    setProgress(0.25);
    setSelectedCourse(selectedValue);
    await AsyncStorage.setItem("selectedCourse", selectedValue);
    setProgress(0.5);
    setPlaceholderCourse(selectedValue);
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
          borderColor: radioColor,
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
              backgroundColor: radioColor,
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
