// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, useColorScheme } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import Heading from "../../components/textFields/Heading";
import {
  DualisRouteParams,
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData,
  GpaSemesterData,
} from "../../interfaces/dualisInterfaces";
import Subheading from "../../components/textFields/Subheading";
import Dropdown from "../../components/dropdown/Dropdown";
import { useNavigation } from "@react-navigation/native";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dualis: React.FC = () => {
  const route = useRoute<RouteProp<{ params: DualisRouteParams }, "params">>();

  const {
    moduleData: routeModuleData,
    gpaData: routeGpaData,
    ectsData: routeEctsData,
    semesterData: routeSemesterData,
    gradeData: routeGradeData,
    gpaSemesterData: routeGpaSemesterData,
  } = route.params;
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  const [moduleData, setModuleData] = useState<Array<ModuleData>>(
    routeModuleData || [],
  );
  const [gradeData, setGradeData] = useState<GradeData[]>(routeGradeData || []);
  const [gpaSemesterData, setGpaSemesterData] = useState<GpaSemesterData[]>(
    routeGpaSemesterData || [],
  );
  const [gpaData, setGpaData] = useState<GpaData>(
    routeGpaData || { gpaTotal: "", gpaSubject: "" },
  );
  const [ectsData, setEctsData] = useState<EctsData>(
    routeEctsData || { ectsTotal: "", ectsSum: "" },
  );
  const [semesterData, setSemesterData] = useState<SemesterData>(
    routeSemesterData || { semester: [] },
  );
  const [selectedSemester, setSelectedSemester] =
    useState<string>("Leistungsübersicht");
  const [isLight, setIsLight] = useState(false);

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Set the icon color based on the color scheme
  const iconColor = isLight ? "#FFFFFF" : "#000000";

  // Function to get available semesters and add "Leistungsübersicht" as the first option
  const getSemesterDropdownValues = () => {
    const semesterOptions = semesterData.semester.map((semester) => ({
      key: semester.value,
      value: semester.name,
    }));

    // Add "Leistungsübersicht" as the first option
    return [
      {
        key: "Leistungsübersicht",
        value: "Leistungsübersicht",
      },
      ...semesterOptions,
    ];
  };

  const filteredGradeData =
    selectedSemester === "Leistungsübersicht"
      ? gradeData
      : gradeData.filter((grade) => grade.semester === selectedSemester);

  const filteredGpaSemesterData =
    selectedSemester === "Leistungsübersicht"
      ? gpaSemesterData
      : gpaSemesterData.filter((gpa) => gpa.semester === selectedSemester);

  const handleLogout = () => {
    // Reset all state to empty or default values
    setModuleData([]);
    setGpaData({ gpaTotal: "", gpaSubject: "" });
    setEctsData({ ectsTotal: "", ectsSum: "" });
    setSemesterData({ semester: [] });
    setGradeData([]);
    setGpaSemesterData([]);

    // Navigate to the login screen after logout
    navigation.reset({
      index: 0,
      routes: [{ name: "Dualis", params: { screen: "DualisLogin" } }],
    });
  };

  // Set the header button dynamically
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleLogout}>
          <Icon
            name="logout"
            size={30}
            color={iconColor}
            style={{ marginLeft: "auto", marginRight: 15 }}
          />
        </Pressable>
      ),
    });
  }, [navigation, colorScheme]);

  return (
    <View className="h-screen bg-light_primary dark:bg-dark_primary flex-1">
      <View className="mt-5">
        <Heading text="Noten" />
      </View>
      <Dropdown
        setSelected={setSelectedSemester}
        values={getSemesterDropdownValues()}
        placeholder="Semester auswählen"
        save="value"
        defaultOption={{
          key: "Leistungsübersicht",
          value: "Leistungsübersicht",
        }}
      />
      <ScrollView>
        {selectedSemester === "Leistungsübersicht" ? (
          <View className="mt-4 p-4 rounded w-full">
            <DefaultText text={`ECTS: ${ectsData.ectsSum}`} />
            <DefaultText text={`ECTS benötigt: ${ectsData.ectsTotal}`} />
            <DefaultText text={`Gesamt-GPA: ${gpaData.gpaTotal}`} />
            <DefaultText text={`Hauptfach-GPA: ${gpaData.gpaSubject}`} />
            {moduleData.length > 0
              ? moduleData.map((module, index) => (
                  <View key={index} className="mb-4">
                    <Subheading text={`${module.number} - ${module.name}`} />
                    <DefaultText text={`ECTS: ${module.ects}`} />
                    <DefaultText text={`Note: ${module.grade}`} />
                    <DefaultText text={module.passed ? "Bestanden" : ""} />
                  </View>
                ))
              : null}
          </View>
        ) : null}

        {filteredGradeData.length > 0 &&
        selectedSemester !== "Leistungsübersicht" ? (
          <View>
            {filteredGradeData.map((grade, index) => (
              <View key={index} className="mb-4">
                <Subheading text={`${grade.number} - ${grade.name}`} />
                <DefaultText text={`ECTS: ${grade.ects}`} />
                <DefaultText text={`Note: ${grade.grade}`} />
                <DefaultText text={`Status: ${grade.status}`} />
                <DefaultText text={`Detail: ${grade.detail}`} />
                <DefaultText text={`Semester: ${grade.semester}`} />
                {grade.detailGrade.map((detail, detailIndex) => (
                  <View key={detailIndex} className="mb-4">
                    <DefaultText text={detail.semester} />
                    <DefaultText text={detail.exam} />
                    <DefaultText text={detail.date} />
                    <DefaultText text={detail.grade} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {filteredGpaSemesterData.length > 0 &&
        selectedSemester !== "Leistungsübersicht" ? (
          <View>
            {filteredGpaSemesterData.map((semester, index) => (
              <View key={index} className="mb-4">
                <DefaultText text={`Semester: ${semester.semester}`} />
                <DefaultText text={semester.name} />
                <DefaultText text={`GPA: ${semester.grade}`} />
                <DefaultText text={`ECTS: ${semester.ects}`} />
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Dualis;
