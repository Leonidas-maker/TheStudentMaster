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

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  let activateCallback = useRef(false);

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  useEffect(() => {
    const fetchData = async () => {
      activateCallback.current = false;
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
      activateCallback.current = true;
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
            setSelected={handleCourseSelect}
            values={courseDropdownValues}
            placeholder={placeholderCourse}
            search={true}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default CourseSettings;
