// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect, useRef } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import * as Progress from "react-native-progress";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import { useTheme } from "../../provider/ThemeProvider";
import DefaultText from "../../components/textFields/DefaultText";
import Dropdown from "../../components/dropdown/Dropdown";
import Subheading from "../../components/textFields/Subheading";
import RadioOption from "../../components/radioOption/RadioOption";
import TextFieldInput from "../../components/textInputs/TextFieldInput2";
import SaveToast from "../../components/toasts/SaveToast";
import { removeData } from "../../services/asyncStorageHelper";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import { fetchEventsWithoutWait } from "../../services/eventService";
import {
  fetchCalendars,
  getSelectedUniversity,
  getSelectedCourse,
  fetchInitialHash,
} from "../../services/calendarService";

import { storeData, getData } from "../../services/asyncStorageHelper";
import {
  getMailServerCredentials,
  storeSecret,
} from "../../services/secureStorageHelper";

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

  const [mailServerDataFirstLoad, setMailServerDataFirstLoad] = useState(true);
  const [mailServerUsername, setMailServerUsername] = useState("");
  const [mailServerPassword, setMailServerPassword] = useState("");
  const [mailServerDomain, setMailServerDomain] = useState("");
  const [mailServerPort, setMailServerPort] = useState("");

  const prevMailServerUsername = useRef(mailServerUsername);
  const prevMailServerPassword = useRef(mailServerPassword);
  const prevMailServerDomain = useRef(mailServerDomain);
  const prevMailServerPort = useRef(mailServerPort);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState("");

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
  // ====================== Effects ======================= //
  // ====================================================== //

  // ~~~~~~~~~~~~~~ Use effect ~~~~~~~~~~~~~ //
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setProgress(0.25);
      await fetchCalendars(setCalendars);
      setProgress(0.5);
      await getSelectedUniversity(
        setSelectedUniversity,
        setPlaceholderUniversity,
        setMissingUniversity
      );
      setProgress(0.75);
      await getSelectedCourse(
        setSelectedCourse,
        setPlaceholderCourse,
        setMissingCourse
      );
      setProgress(1);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const saveMailServerData = async () => {
        let changed = false;
        if (mailServerUsername !== prevMailServerUsername.current) {
          await storeSecret("mailServerUsername", mailServerUsername);
          prevMailServerUsername.current = mailServerUsername;
          changed = true;
        }

        if (mailServerPassword !== prevMailServerPassword.current) {
          await storeSecret("mailServerPassword", mailServerPassword);
          prevMailServerPassword.current = mailServerPassword;
          changed = true;
        }

        if (mailServerDomain !== prevMailServerDomain.current) {
          await storeData("mailServerDomain", mailServerDomain);
          prevMailServerDomain.current = mailServerDomain;
          changed = true;
        }

        if (mailServerPort !== prevMailServerPort.current) {
          await storeData("mailServerPort", mailServerPort);
          prevMailServerPort.current = mailServerPort;
          changed = true;
        }

        if (changed) {
          setSaveToastMessage("Mail server data saved");
          setShowSaveToast(true);
        }
      };
      if (!mailServerDataFirstLoad) {
        saveMailServerData();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    mailServerUsername,
    mailServerPassword,
    mailServerDomain,
    mailServerPort,
  ]);

  // ~~~~~~~~~~~~~ Focus effect ~~~~~~~~~~~~ //
  useFocusEffect(
    React.useCallback(() => {
      const prepareMailServerData = async () => {
        const { username, password } = await getMailServerCredentials();
        const mailServerDomain = await getData("mailServerDomain");
        const mailServerPort = await getData("mailServerPort");

        setMailServerUsername(username || "");
        setMailServerPassword(password || "");
        setMailServerDomain(mailServerDomain || "");
        setMailServerPort(mailServerPort || "");

        prevMailServerUsername.current = username || "";
        prevMailServerPassword.current = password || "";
        prevMailServerDomain.current = mailServerDomain || "";
        prevMailServerPort.current = mailServerPort || "";

        setMailServerDataFirstLoad(false);
      };

      // Do something when the screen is focused
      prepareMailServerData();
      return () => {
        // Do something when the screen is unfocused
      };
    }, [])
  );

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
    const selectedUni = calendars.find(
      (calendar) => calendar.university_name === selectedValue
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
        JSON.stringify(selectedUniData)
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

  // Handle the course select and gets data from backend
  // Sets progress and loading state
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

  // Dropdown values for the courses
  // Based on the selected university
  const courseDropdownValues = selectedUniversity
    ? calendars
        .find(
          (calendar) => calendar.university_uuid === selectedUniversity.uuid
        )
        ?.course_names.map((course: string) => ({
          key: course,
          value: course,
        })) || []
    : [];

  // ====================================================== //
  // ================== Input validation ================== //
  // ====================================================== //

  const validatePort = (value: string): string => {
    if (!/^\d+$/.test(value)) {
      return "The port must be a number";
    }
    const portNumber = parseInt(value, 10);
    if (portNumber < 0 || portNumber > 65535) {
      return "The port must be between 0 and 65535";
    }
    return "";
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex-1">
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
          <Subheading text="Email Server" />
          <TextFieldInput
            label="Username"
            value={mailServerUsername}
            onTextChange={setMailServerUsername}
            autoCapitalize="none"
            keyboardType="default"
          />
          <TextFieldInput
            label="Password"
            value={mailServerPassword}
            onTextChange={setMailServerPassword}
            autoCapitalize="none"
            secureTextEntry={true}
          />
          <TextFieldInput
            label="Domain"
            value={mailServerDomain}
            onTextChange={setMailServerDomain}
            autoCapitalize="none"
            keyboardType="default"
          />
          <TextFieldInput
            label="Port"
            value={mailServerPort}
            onTextChange={setMailServerPort}
            keyboardType="numeric"
            validate={validatePort}
          />
          <Pressable className="p-4 mb-2 rounded shadow bg-light_primary dark:bg-dark_primary active:opacity-50"
            onPress={() => removeData("mailServerEmails")}>
          <Text>Clear Email Cache</Text>
          </Pressable>
          
        </View>
      </ScrollView>
      <SaveToast
        visible={showSaveToast}
        setVisible={setShowSaveToast}
        message={saveToastMessage}
      />
    </View>
  );
};

export default Settings;
