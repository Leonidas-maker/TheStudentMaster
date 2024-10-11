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
import { loginDualis } from "../../services/dualis/loginService";
import {
  navigateToPerformanceOverview,
  navigateToExamResults,
  navigateThroughSemesters,
  navigateThroughGradeDetails,
} from "../../services/dualis/navigationService";

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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
  const [saveLogin, setSaveLogin] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authArguments, setAuthArguments] = useState<string>("");
  const [navigatedThroughSemesters, setNavigatedThroughSemesters] =
    useState(false);
  const [navigatedThroughGradeDetails, setNavigatedThroughGradeDetails] =
    useState(false);

  // Function to save login credentials
  const saveCredentials = () => {
    asyncSaveData("dualisUsername", username);
    secureSaveData("dualisPassword", password);
  };

  // Function to remove login credentials
  const removeCredentials = async () => {
    asyncRemoveData("dualisUsername");
    secureRemoveData("dualisPassword");
  };

  // Load saveLogin state from AsyncStorage when component mounts
  useEffect(() => {
    const loadSavedLogin = async () => {
      const savedSaveLogin = await asyncLoadData("saveDualisLogin");

      if (savedSaveLogin !== null) {
        setSaveLogin(JSON.parse(savedSaveLogin)); // Convert string back to boolean
      }
    };

    loadSavedLogin();
  }, []);

  // Save saveLogin state to AsyncStorage when it changes
  useEffect(() => {
    asyncSaveData("saveDualisLogin", JSON.stringify(saveLogin));
  }, [saveLogin]);

  // Load saved credentials when component mounts
  useEffect(() => {
    const loadCredentials = async () => {
      const savedUsername = await asyncLoadData("dualisUsername");
      const savedPassword = await secureLoadData("dualisPassword");

      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);

      setIsLoginLoading(false);
    };

    if (saveLogin) {
      loadCredentials();
    } else {
      setIsLoginLoading(false);
    }
  }, [saveLogin]);

  // Toggles the save login switch
  const toggleSaveLogin = () => {
    setSaveLogin(!saveLogin);

    // Remove credentials if saveLogin is disabled
    if (!saveLogin === false) {
      removeCredentials();
    }
  };

  // Function to handle login
  const login = async () => {
    setLoading(true);
    setProgress(0);

    await loginDualis(
      username,
      password,
      saveCredentials,
      setError,
      setAuthArguments,
      saveLogin,
    );
  };

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
        );
      }
    };

    handleGradeDetailsNavigation();
  }, [gradeData, authArguments]);

  // Wait for login data to load (this is very fast so it will most likely not be shown)
  if (isLoginLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <DefaultText text="Lade Anmeldedaten..." />
      </View>
    );
  }

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      {loading && <Progress.Bar progress={progress} width={null} />}
      {error ? <DefaultText text={error} /> : null}
      <Heading text="Noten" />
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
  );
};

export default Dualis;
