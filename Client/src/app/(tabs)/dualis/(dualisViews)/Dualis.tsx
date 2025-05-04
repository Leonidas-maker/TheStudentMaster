// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, ScrollView, Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Heading from "../../../../components/textFields/Heading";
import {
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData,
  GpaSemesterData,
} from "../../../../interfaces/dualisInterfaces";
import Dropdown from "../../../../components/dropdown/Dropdown";
import DualisOverviewText from "../../../../components/textFields/dualisTextFields/DualisOverviewText";
import DualisOverviewDescText from "../../../../components/textFields/dualisTextFields/DualisOverviewDescText";
import DualisModuleText from "../../../../components/textFields/dualisTextFields/DualisModuleText";
import DualisHeaderModuleText from "../../../../components/textFields/dualisTextFields/DualisHeaderModuleText";
import DualisHeaderDescText from "../../../../components/textFields/dualisTextFields/DualisHeaderDescText";
import DualisNumberText from "../../../../components/textFields/dualisTextFields/DualisNumberText";
import DualisDetailText from "../../../../components/textFields/dualisTextFields/DualisDetailText";
import DualisModuleDetailText from "../../../../components/textFields/dualisTextFields/DualisModuleDetailText";
import DualisExamDetailText from "../../../../components/textFields/dualisTextFields/DualisExamDetailText";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dualis: React.FC = () => {
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation();
  const router = useRouter();

  const params = useLocalSearchParams();
  const moduleData: ModuleData[] = params.moduleData
    ? JSON.parse(params.moduleData as string)
    : [];
  const gpaData: GpaData = params.gpaData
    ? JSON.parse(params.gpaData as string)
    : { gpaTotal: "", gpaSubject: "" };
  const ectsData: EctsData = params.ectsData
    ? JSON.parse(params.ectsData as string)
    : { ectsTotal: "", ectsSum: "" };
  const semesterData: SemesterData = params.semesterData
    ? JSON.parse(params.semesterData as string)
    : { semester: [] };
  const gradeData: GradeData[] = params.gradeData
    ? JSON.parse(params.gradeData as string)
    : [];
  const gpaSemesterData: GpaSemesterData[] = params.gpaSemesterData
    ? JSON.parse(params.gpaSemesterData as string)
    : [];

  const [selectedSemester, setSelectedSemester] =
    useState<string>("Leistungsübersicht");

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Set the icon color based on the color scheme
  const iconColor = colorScheme !== "light" ? "#FFFFFF" : "#000000";
  const checkColor = colorScheme !== "light" ? "#497740" : "#629F56";
  // Colors from the background, so the check icon is not visible and the dimensions are right
  const placeholderColor = colorScheme !== "light" ? "#E8EBF7" : "#1E1E24";

  // Function to get available semesters and add "Leistungsübersicht" as the first option
  const getSemesterDropdownValues = () => {
    const semesterOptions = semesterData.semester.map((semester: any) => ({
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
      : gradeData.filter((grade: any) => grade.semester === selectedSemester);

  const filteredGpaSemesterData =
    selectedSemester === "Leistungsübersicht"
      ? gpaSemesterData
      : gpaSemesterData.filter((gpa: any) => gpa.semester === selectedSemester);

  const handleLogout = () => {
    // Navigate to the login screen after logout
    router.replace("/(tabs)/dualis");
  };

  // Set the header button dynamically
  useEffect(() => {
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
      <ScrollView>
        {selectedSemester.length > 1 &&
        selectedSemester === "Leistungsübersicht" ? (
          <View>
            <View className="mt-4 w-full">
              <Heading text="Übersicht" />
              <View className="flex-row p-2 pl-5 items-end">
                <DualisOverviewText text={`${gpaData.gpaTotal}`} />
                <DualisOverviewDescText text="Gesamt-GPA" />
              </View>
              <View className="flex-row p-2 pl-5 items-end">
                <DualisOverviewText text={`${gpaData.gpaSubject}`} />
                <DualisOverviewDescText text="Hauptfach-GPA" />
              </View>
              <View className="flex-row p-2 pl-5 items-end">
                <DualisOverviewText
                  text={`${ectsData.ectsSum} / ${ectsData.ectsTotal}`}
                />
                <DualisOverviewDescText text="ECTS" />
              </View>
              <View className="py-4">
                <Heading text="Studienergebnisse" />
              </View>
              {moduleData.length > 0 ? (
                <View>
                  <View className="flex-row items-center justify-between flex-wrap m-2">
                    <DualisHeaderModuleText text="Modul" />
                    <DualisHeaderDescText text="ECTS" />
                    <DualisHeaderDescText text="Note" />
                    <View className="w-1/10 items-end px-3">
                      <Icon name="check" size={20} color={placeholderColor} />
                    </View>
                  </View>

                  {moduleData.map((module: any, index: number) => (
                    <View key={index} className="mx-2">
                      <View className="flex-row items-center justify-between flex-wrap">
                        <View className="flex-1">
                          <DualisNumberText text={`${module.number}`} />
                          <DualisModuleText text={`${module.name}`} />
                        </View>
                        <DualisDetailText text={`${module.ects}`} />
                        <DualisDetailText text={`${module.grade}`} />
                        <View className="w-1/10 items-end px-3">
                          {module.passed && (
                            <Icon name="check" size={20} color={checkColor} />
                          )}
                        </View>
                      </View>

                      {index < moduleData.length - 1 && (
                        <View className="border-b dark:border-light_secondary border-dark_secondary my-2" />
                      )}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {filteredGpaSemesterData.length > 0 &&
        selectedSemester !== "Leistungsübersicht" ? (
          <View className="mt-4 w-full">
            <Heading text="Übersicht" />
            {filteredGpaSemesterData.map((semester: any, index: number) => (
              <View key={index} className="">
                <View className="flex-row p-2 pl-5 items-end">
                  <DualisOverviewText text={`${semester.grade}`} />
                  <DualisOverviewDescText text="Semester-GPA" />
                </View>
                <View className="flex-row p-2 pl-5 items-end">
                  <DualisOverviewText text={`${semester.ects}`} />
                  <DualisOverviewDescText text="Semester-ECTS" />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {filteredGradeData.length > 0 &&
        selectedSemester !== "Leistungsübersicht" ? (
          <View className="w-full">
            <View className="py-4">
              <Heading text="Ergebnisse" />
            </View>
            <View className="flex-row items-center justify-between flex-wrap m-2">
              <DualisHeaderModuleText text="Modul" />
              <DualisHeaderDescText text="ECTS" />
              <DualisHeaderDescText text="Note" />
              <View className="w-1/10 items-end px-3">
                <Icon name="check" size={20} color={placeholderColor} />
              </View>
            </View>
            {filteredGradeData.map((grade: any, index: number) => (
              <View key={index} className="mx-2">
                <View className="flex-row items-center justify-between flex-wrap">
                  <View className="flex-1">
                    <DualisNumberText text={`${grade.number}`} />
                    <DualisModuleText text={`${grade.name}`} />
                  </View>
                  <DualisDetailText text={`${grade.ects}`} />
                  <DualisDetailText
                    text={
                      grade.grade !== "noch nicht gesetzt"
                        ? `${grade.grade}`
                        : "—"
                    }
                  />
                  <View className="w-1/10 items-end px-3">
                    {grade.status ? (
                      <Icon name="check" size={20} color={checkColor} />
                    ) : (
                      <View style={{ width: 20, height: 20 }} />
                    )}
                  </View>
                </View>
                {grade.detailGrade.map((detail: any, detailIndex: number) => (
                  <View key={detailIndex}>
                    <View className="flex-row items-center justify-between flex-wrap mt-2">
                      <View className="flex-1">
                        <DualisModuleDetailText text={detail.exam} />
                        {detail.semester ? (
                          <DualisModuleDetailText text={detail.semester} />
                        ) : null}
                        {detail.date ? (
                          <DualisModuleDetailText text={detail.date} />
                        ) : null}
                      </View>
                      <DualisExamDetailText
                        text={
                          grade.grade !== "noch nicht gesetzt"
                            ? `${detail.grade}`
                            : "—"
                        }
                      />
                      <View className="w-1/10 items-end px-3">
                        <View style={{ width: 20, height: 20 }} />
                      </View>
                    </View>
                  </View>
                ))}
                {index < filteredGradeData.length - 1 && (
                  <View className="border-b dark:border-light_secondary border-dark_secondary my-2" />
                )}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
      <View className="mb-1">
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
      </View>
    </View>
  );
};

export default Dualis;
