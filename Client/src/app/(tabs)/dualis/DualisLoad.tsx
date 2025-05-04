import React, { useState, useRef } from "react";
import { View, Alert } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";
import { secureLoadData } from "../../../components/storageManager/secureStorageManager";

import {
  navigateToPerformanceOverview,
  navigateToExamResults,
  navigateThroughSemesters,
  navigateThroughGradeDetails,
} from "../../../services/dualis/navigationService";

import {
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData,
  GpaSemesterData,
} from "../../../interfaces/dualisInterfaces";
import { logoutDualis } from "../../../services/dualis/loginService";
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
      let hasTimedOut = false;

      const timeout = setTimeout(() => {
        hasTimedOut = true;
        if (isActive) {
          Alert.alert(
            "Da hat etwas nicht funktioniert :(",
            "Der Ladevorgang dauert länger als erwartet. Du wirst zur Startseite weitergeleitet. Überprüfe deine Internetverbindung und versuche es erneut.",
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [
                      { name: "Dualis", params: { screen: "DualisLogin" } },
                    ],
                  });
                },
              },
            ],
          );
        }
      }, 20000); // 20 seconds

      const runAsync = async () => {
        setLoading(true);
        setProgress(0);

        try {
          const authArgs = await secureLoadData("dualisAuthArgs");
          if (!authArgs) throw new Error("Authentication arguments not found.");

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
          }

          const semData = await navigateToExamResults(
            authArgs,
            setProgress,
            setError,
            setLoad,
          );
          if (semData) semesterData.current = semData;

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
            }
          }

          if (gradeData.current.length > 0) {
            const updatedGradeData = await navigateThroughGradeDetails(
              gradeData.current,
              setProgress,
              setError,
              setLoad,
            );
            if (updatedGradeData) gradeData.current = updatedGradeData;
          }

          logoutDualis(authArgs);

          if (isActive && !hasTimedOut) {
            clearTimeout(timeout); // Stop the timer if successful
            setLoading(false);

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
                        gpaData: gpaData,
                        ectsData: ectsData,
                        semesterData: semesterData,
                        gradeData: gradeData,
                        gpaSemesterData: gpaSemesterData,
                      },
                    },
                  },
                ],
              });
            }
          }
        } catch (err: any) {
          setError(err.message || "Ein unbekannter Fehler ist aufgetreten.");
          setLoading(false);
        }
      };

      runAsync();

      return () => {
        isActive = false;
        clearTimeout(timeout);
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
