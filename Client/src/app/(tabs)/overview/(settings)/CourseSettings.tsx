// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { View, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";
import { useTranslation } from "react-i18next";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Dropdown from "../../../../components/dropdown/Dropdown";
import Subheading from "../../../../components/textFields/Subheading";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import { fetchEventsWithoutWait } from "../../../../services/eventService";
import {
  fetchCalendars,
  getSelectedUniversity,
  getSelectedCourse,
  fetchInitialHash,
} from "../../../../services/calendarService";
import Toast from "react-native-toast-message";
import DefaultToast from "../../../../components/defaultToast/DefaultToast";

import { storeData, getData } from "../../services/asyncStorageHelper";
import {
  getMailServerCredentials,
  storeSecret,
} from "../../services/secureStorageHelper";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import {
  EventTimeProps,
  CalendarProps,
} from "../../../../interfaces/calendarInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const CourseSettings: React.FC = () => {
  const { t } = useTranslation("settings");
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [calendars, setCalendars] = useState<CalendarProps[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<{
    name: string;
    uuid: string;
  } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [placeholderUniversity, setPlaceholderUniversity] = useState(
    t("selectUniversity"),
  );
  const [placeholderCourse, setPlaceholderCourse] = useState(t("selectCourse"));
  const [events, setEvents] = useState<EventTimeProps[]>([]);
  const [missingUniversity, setMissingUniversity] = useState(false);
  const [missingCourse, setMissingCourse] = useState(false);

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  let activateCallback = useRef(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [saveToastMessage, setSaveToastMessage] = useState("");

  // ====================================================== //
  // ====================== Effects ======================= //
  // ====================================================== //

  // ~~~~~~~~~~~~~~ Use effect ~~~~~~~~~~~~~ //
  useEffect(() => {
    const fetchData = async () => {
      activateCallback.current = false;
      setLoading(true);
      setProgress(0.25);
      try {
        const availableCalendars = await fetchCalendars();
        // check success
        if (!Array.isArray(availableCalendars)) {
          throw new Error("Invalid response format");
        }
        if (availableCalendars.length > 0) {
          setCalendars(availableCalendars);
        }
      } catch (err) {
        console.error("Failed to fetch calendars:", err);
        Toast.show({
          type: "error",
          text1: t("connection_error_text1"),
          text2: t("connection_error_text2"),
        });
        setLoading(false);
        return;
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
      activateCallback.current = true;
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
    }, []),
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
    if (!activateCallback.current) return;
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
      setPlaceholderCourse(t("selectCourse"));
    }
  };

  // Handle the course select and gets data from backend
  // Sets progress and loading state
  const handleCourseSelect = async (selectedValue: string) => {
    if (!activateCallback.current) return;
    setLoading(true);
    setProgress(0.25);
    if (!selectedValue) {
      setLoading(false);
      return;
    }
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
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      {loading && <Progress.Bar progress={progress} width={null} />}
      <View className="p-4">
        <Subheading text={t("settings_course_header")} />
        <Dropdown
          setSelected={handleUniversitySelect}
          values={dropdownUniversityValues}
          placeholder={placeholderUniversity}
        />
        {selectedUniversity && (
          <Dropdown
            setSelected={handleUniversitySelect}
            values={dropdownUniversityValues}
            placeholder={placeholderUniversity}
          />
        )}
      </View>
      <DefaultToast />
    </ScrollView>
  );
};

export default CourseSettings;
