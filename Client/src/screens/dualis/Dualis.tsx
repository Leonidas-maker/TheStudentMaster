// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import * as Progress from "react-native-progress";
import { useRoute, RouteProp } from "@react-navigation/native"; // Import useRoute

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import Heading from "../../components/textFields/Heading";
import {
  asyncSaveData,
  asyncLoadData,
  asyncRemoveData,
} from "../../components/storageManager/asyncStorageManager";
import {
  secureSaveData,
  secureLoadData,
  secureRemoveData,
} from "../../components/storageManager/secureStorageManager";
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

  const [error, setError] = useState("");
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
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

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
      ...semesterOptions, // Spread the rest of the semester options
    ];
  };

  return (
    <View>
      <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
        <Heading text="Noten" />
        <Dropdown
          setSelected={setSelectedSemester}
          values={getSemesterDropdownValues()} // Use the function to get values
          placeholder="Semester auswählen"
          save="key"
          defaultOption={{ key: "Leistungsübersicht", value: "Leistungsübersicht" }}
        />
        {gradeData.length > 0 ? (
          <View>
            {gradeData.map((grade, index) => (
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
        {gpaSemesterData.map((semester, index) => (
          <View key={index} className="mb-4">
            <DefaultText text={`Semester: ${semester.semester}`} />
            <DefaultText text={semester.name} />
            <DefaultText text={`GPA: ${semester.grade}`} />
            <DefaultText text={`ECTS: ${semester.ects}`} />
          </View>
        ))}
        <View className="mt-4 p-4 rounded w-full">
          {semesterData.semester.length > 0
            ? semesterData.semester.map((semester, index) => (
              <View key={index} className="mb-4">
                <DefaultText text={semester.name} />
                <DefaultText text={semester.value} />
              </View>
            ))
            : null}
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
      </ScrollView>
    </View>
  );
};

export default Dualis;
