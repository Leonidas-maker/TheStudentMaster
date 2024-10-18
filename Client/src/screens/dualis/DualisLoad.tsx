import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import Heading from "../../components/textFields/Heading";
import Subheading from "../../components/textFields/Subheading";
import { secureLoadData } from "../../components/storageManager/secureStorageManager";

import {
  navigateToPerformanceOverview,
  navigateToExamResults,
  navigateThroughSemesters,
  navigateThroughGradeDetails,
} from "../../services/dualis/navigationService";

import {
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData,
  GpaSemesterData,
} from "../../interfaces/dualisInterfaces";
import { logoutDualis } from "../../services/dualis/loginService";
import { set } from "lodash";

const DualisLoad: React.FC = () => {
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const moduleData = useRef<Array<ModuleData>>([]);
  const gradeData = useRef<Array<GradeData>>([]);
  const gpaSemesterData = useRef<Array<GpaSemesterData>>([]);
  const gpaData = useRef<GpaData>({ gpaTotal: "", gpaSubject: "" });
  const ectsData = useRef<EctsData>({ ectsTotal: "", ectsSum: "" });
  const semesterData = useRef<SemesterData>({ semester: [] });

  const [load, setLoad] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const runAsync = async () => {
        setLoading(true);
        setProgress(0);

        // Load authArguments from secure storage
        const authArgs = await secureLoadData("dualisAuthArgs");
        if (!authArgs) {
          setError("Authentication arguments not found.");
          setLoading(false);
          return;
        }

        // Navigate to Performance Overview
        const perfData = await navigateToPerformanceOverview(
          authArgs,
          setProgress,
          setError,
          setLoad,
        );
        if (perfData) {
          moduleData.current = perfData.moduleData;
          gpaData.current = perfData.gpaData;
          ectsData.current = perfData.ectsData;
        } else {
          setLoading(false);
          return;
        }

        // Navigate to Exam Results
        const semData = await navigateToExamResults(
          authArgs,
          setProgress,
          setError,
          setLoad,
        );
        if (semData) {
          semesterData.current = semData;
        } else {
          setLoading(false);
          return;
        }

        // Navigate through Semesters
        if (semesterData.current.semester.length > 0) {
          const semResults = await navigateThroughSemesters(
            authArgs,
            semesterData.current.semester,
            setProgress,
            setError,
            setLoad,
          );
          if (semResults) {
            gradeData.current = semResults.gradeData;
            gpaSemesterData.current = semResults.gpaSemesterData;
          } else {
            setLoading(false);
            return;
          }
        }

        // Navigate through Grade Details
        if (gradeData.current.length > 0) {
          const updatedGradeData = await navigateThroughGradeDetails(
            gradeData.current,
            setProgress,
            setError,
            setLoad,
          );
          if (updatedGradeData) {
            gradeData.current = updatedGradeData;
          } else {
            setLoading(false);
            return;
          }
          logoutDualis(authArgs);
        }

        // Update states
        if (isActive) {
          setLoading(false);

          // Navigate to Dualis Performance screen
          if (gpaSemesterData.current.length > 0) {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: "Dualis",
                  params: {
                    screen: "DualisPerfomance",
                    params: {
                      moduleData: moduleData,
                      gpaData: ectsData,
                      ectsData: ectsData,
                      semesterData: semesterData,
                      gradeData: gradeData,
                      gpaSemesterData:  gpaSemesterData,
                    },
                  },
                },
              ],
            });
          }
        }
      };

      runAsync();

      return () => {
        isActive = false;
      };
    }, [navigation]),
  );

  return (
    <View className="h-screen bg-light_primary dark:bg-dark_primary flex-1 justify-center items-center">
      <Heading text="Lade Dualis Daten" />
      <Subheading text="Dies kann einige Sekunden dauern..." />

      <View className="justify-center w-[80%]">
        {loading && (
          <Progress.Bar
            progress={progress}
            width={null}
            animationType="timing"
          />
        )}
      </View>

      <Subheading text={`Lade ${load}...`} />
    </View>
  );
};

export default DualisLoad;
