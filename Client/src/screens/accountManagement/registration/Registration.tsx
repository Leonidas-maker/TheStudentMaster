// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, ScrollView, Keyboard, Pressable } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Dropdown from "../../../components/dropdown/Dropdown";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import OptionSwitch from "../../../components/switch/OptionSwitch";
import Heading from "../../../components/textFields/Heading";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import {
  UniversityProps,
  UniversityDropdownItemProps,
} from "../../../interfaces/UserInterfaces";

// Test Data
import universityData from "../testData/courseData.json";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Registration: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [isNotification, setIsNotification] = useState(false);
  const [is2FA, setIs2FA] = useState(false);
  const [universities, setUniversities] = useState<
    UniversityDropdownItemProps[]
  >([]);
  const [selectedUniversity, setSelectedUniversity] =
    useState<UniversityProps | null>(null);
  const [courses, setCourses] = useState<UniversityDropdownItemProps[]>([]);

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Set the university dropdown items
  useEffect(() => {
    const universityItems: UniversityDropdownItemProps[] = universityData.map(
      (uni, index) => ({
        key: String(index + 1),
        value: uni.university_name,
      }),
    );
    setUniversities(universityItems);
  }, []);

  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  // Toggles the notification switch
  const toggleNotification = () =>
    setIsNotification((previousState) => !previousState);
  const toggle2FA = () => setIs2FA((previousState) => !previousState);

  // Handles the university change
  const handleUniversityChange = (selectedValue: string) => {
    const universityIndex = universities.findIndex(
      (u) => u.value === selectedValue,
    );
    const university = universityData[universityIndex];
    if (university) {
      setSelectedUniversity(university);
      const courseItems: UniversityDropdownItemProps[] =
        university.course_names.map((course, index) => ({
          key: String(index + 1),
          value: course,
        }));
      setCourses(courseItems);
    }
  };

  // Sets the selected University
  const onSelectUniversity = (value: string) => {
    handleUniversityChange(value);
  };

  // Sets the selected Course
  const onSelectCourse = (value: string) => {
    setCourses(courses.filter((c) => c.value === value));
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // ====================================================== //
  // ==================== OptionSwitch ==================== //
  // ====================================================== //
  const optionTitle = "Weitere Optionen";

  const optionTexts = ["Benachrichtigungen", "2FA"];

  const optionIconNames = ["dashboard", "school"];

  const optionOnValueChanges = [toggleNotification, toggle2FA];

  const optionValues = [isNotification, is2FA];

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  // Username, Email, Password, Confirm Password, Register Button
  // Optional fields: Address, City, State, Zip Code, Country, Profile Picture
  // Checkbox for 2FA
  // Checkbox for Terms and Conditions
  // Checkbox for Email Notifications
  return (
    <Pressable onPress={dismissKeyboard}>
      <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
        <View className="justify-center items-center">
          <Heading text="Account erstellen" />
          <TextFieldInput
            autoCapitalize="none"
            autoFocus={true}
            enterKeyHint="next"
            placeholder="Nutzername"
            autoComplete="username"
          />
          <TextFieldInput
            autoCapitalize="none"
            enterKeyHint="next"
            placeholder="E-Mail Adresse"
            autoComplete="email"
          />
          <TextFieldInput
            autoCapitalize="none"
            enterKeyHint="next"
            placeholder="Passwort"
            secureTextEntry={true}
            autoComplete="new-password"
          />
          <TextFieldInput
            autoCapitalize="none"
            enterKeyHint="done"
            placeholder="Passwort wiederholen"
            secureTextEntry={true}
            autoComplete="new-password"
          />
        </View>
        <View>
          <Dropdown
            setSelected={onSelectUniversity}
            values={universities}
            placeholder="Universität auswählen"
          />
          <Dropdown
            setSelected={onSelectCourse}
            values={courses}
            placeholder="Kurs auswählen"
            search={true}
          />
        </View>
        <View className="justify-center items-center">
          <DefaultButton text="Registrieren" />
        </View>
        <OptionSwitch
          title={optionTitle}
          texts={optionTexts}
          iconNames={optionIconNames}
          onValueChanges={optionOnValueChanges}
          values={optionValues}
        />
      </ScrollView>
    </Pressable>
  );
};

export default Registration;
