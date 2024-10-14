import React, { useEffect, useState } from "react";
import { View } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";

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

  const [authArguments, setAuthArguments] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [moduleData, setModuleData] = useState<Array<ModuleData>>([]);
  const [gradeData, setGradeData] = useState<GradeData[]>([]);
  const [gpaSemesterData, setGpaSemesterData] = useState<GpaSemesterData[]>([]);
  const [gpaData, setGpaData] = useState<GpaData>({
    gpaTotal: "",
    gpaSubject: "",
  });
  const [ectsData, setEctsData] = useState<EctsData>({
    ectsTotal: "",
    ectsSum: "",
  });
  const [semesterData, setSemesterData] = useState<SemesterData>({
    semester: [],
  });
  const [navigatedThroughSemesters, setNavigatedThroughSemesters] =
    useState(false);
  const [navigatedThroughGradeDetails, setNavigatedThroughGradeDetails] =
    useState(false);
  const [load, setLoad] = useState("");

  useEffect(() => {
    setLoading(true);
    setProgress(0);
    const loadAuthArgs = async () => {
      const authArguments = await secureLoadData("dualisAuthArgs");

      if (authArguments) setAuthArguments(authArguments);
    };

    loadAuthArgs();
  }, []);

  useEffect(() => {
    const handlePerformanceOverviewNavigation = async () => {
      if (authArguments) {
        await navigateToPerformanceOverview(
          authArguments,
          setModuleData,
          setGpaData,
          setEctsData,
          setProgress,
          setError,
          setLoad,
        );
      }
    };

    handlePerformanceOverviewNavigation();
  }, [authArguments]);

  useEffect(() => {
    const handleExamResultsNavigation = async () => {
      if (authArguments) {
        await navigateToExamResults(
          authArguments,
          setSemesterData,
          setProgress,
          setError,
          setLoad,
        );
      }
    };

    handleExamResultsNavigation();
  }, [authArguments]);

  useEffect(() => {
    const handleSemesterNavigation = async () => {
      if (
        semesterData.semester.length > 0 &&
        authArguments &&
        !navigatedThroughSemesters
      ) {
        setNavigatedThroughSemesters(true);
        await navigateThroughSemesters(
          authArguments,
          semesterData.semester,
          setGradeData,
          setGpaSemesterData,
          setProgress,
          setError,
          setLoad,
        );
      }
    };

    handleSemesterNavigation();
  }, [semesterData.semester, authArguments]);

  useEffect(() => {
    const handleGradeDetailsNavigation = async () => {
      if (
        gradeData.length > 0 &&
        authArguments &&
        !navigatedThroughGradeDetails
      ) {
        setNavigatedThroughGradeDetails(true);
        await navigateThroughGradeDetails(
          gradeData,
          setGradeData,
          setProgress,
          setError,
          setLoading,
          setLoad,
        );
  
        logoutDualis(authArguments);
      }
    };
  
    handleGradeDetailsNavigation();
  }, [gradeData, authArguments]);

  useEffect(() => {
    if (gpaSemesterData.length > 0 && navigatedThroughGradeDetails) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Dualis",
            params: {
              screen: "DualisPerfomance",
              params: {
                moduleData,
                gpaData,
                ectsData,
                semesterData,
                gradeData,
                gpaSemesterData, 
              },
            },
          },
        ],
      });
    }
  }, [gpaSemesterData, navigatedThroughGradeDetails]);
  
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
