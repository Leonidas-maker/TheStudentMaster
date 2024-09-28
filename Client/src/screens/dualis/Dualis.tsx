// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";
import { Parser } from "htmlparser2";
import * as Progress from "react-native-progress";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import TextFieldInput from "../../components/textInputs/TextFieldInput";
import DefaultButton from "../../components/buttons/DefaultButton";
import Heading from "../../components/textFields/Heading";
import OptionSwitch from "../../components/switch/OptionSwitch";
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
import { filterPerformanceOverview } from "../../scraper/dualis/performanceOverviewScraper";
import { filterGPA } from "../../scraper/dualis/gpaScraper";
import { filterECTS } from "../../scraper/dualis/ectsScraper";
import { filterSemester } from "../../scraper/dualis/semesterScraper";
import {
  ModuleData,
  GpaData,
  EctsData,
  SemesterData,
  GradeData
} from "../../interfaces/dualisInterfaces";
import { filterGrade } from "../../scraper/dualis/gradeScraper";

// Define the base URL for the Dualis API
const BASE_URL = "https://dualis.dhbw.de";

// Create an axios instance with specific configuration
const axiosInstance = axios.create({
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Dualis: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");
  const [moduleData, setModuleData] = useState<Array<ModuleData>>([]);
  const [gradeData, setGradeData] = useState<GradeData[]>([]);
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
  const [saveLogin, setSaveLogin] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authArguments, setAuthArguments] = useState<string>("");
  const [naviagtedThroughSemesters, setNavigatedThroughSemesters] =
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
      setIsLoginLoading(false); // Set loading state to false if saveLogin is disabled
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
    try {
      const url = `${BASE_URL}/scripts/mgrqispi.dll`;

      const formData = new URLSearchParams();
      formData.append("usrname", username);
      formData.append("pass", password);
      formData.append("APPNAME", "CampusNet");
      formData.append("PRGNAME", "LOGINCHECK");
      formData.append(
        "ARGUMENTS",
        "clino,usrname,pass,menuno,menu_type,browser,platform",
      );
      formData.append("clino", "000000000000001");
      formData.append("menuno", "000324");
      formData.append("menu_type", "classic");
      formData.append("browser", "");
      formData.append("platform", "");

      const response = await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const content = response.data;
      const status = response.status;

      if (status !== 200 || content.length > 500) {
        setError("Login failed. Please check your credentials.");
        return;
      }

      // Extract auth arguments and save them
      const authArgs = extractAuthArguments(response.headers["refresh"]);
      setAuthArguments(authArgs);

      setProgress(0.2);
      setError("");
      await navigateToPerformanceOverview(
        extractAuthArguments(response.headers["refresh"]),
      );

      await navigateToExamResults(
        extractAuthArguments(response.headers["refresh"]),
      );

      // Save credentials after successful login
      if (saveLogin) {
        await saveCredentials();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      semesterData.semester.length > 0 &&
      authArguments &&
      !naviagtedThroughSemesters
    ) {
      navigateThroughSemesters(authArguments, semesterData.semester);
      setNavigatedThroughSemesters(true);
    }
  }, [semesterData.semester, authArguments]);

  const extractAuthArguments = (refreshHeader: string) => {
    setProgress(0.1);
    if (refreshHeader) {
      return refreshHeader.slice(84).replace("-N000000000000000", "");
    }
    return "";
  };

  const navigateToPerformanceOverview = async (authArguments: string) => {
    setProgress(0.3);
    try {
      const performanceUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=STUDENT_RESULT&ARGUMENTS=${authArguments},-N000310,-N0,-N000000000000000,-N000000000000000,-N000000000000000,-N0,-N000000000000000`;
      const response = await axiosInstance.get(performanceUrl);
      const content = response.data;

      // Set HTML content
      setHtmlContent(content);

      // Parse HTML content and filter the required data
      filterPerformanceOverview(content, setModuleData);
      setProgress(0.33);
      filterGPA(content, setGpaData);
      setProgress(0.36);
      filterECTS(content, setEctsData);
      setProgress(0.4);
    } catch (err) {
      setError(
        "An error occurred while navigating to the performance overview. Please try again.",
      );
      console.error(err);
    }
  };

  const navigateToExamResults = async (authArguments: string) => {
    setProgress(0.5);
    try {
      const examResultsUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments},-N000307`;
      const response = await axiosInstance.get(examResultsUrl);
      const content = response.data;

      // Set HTML content
      setHtmlContent(content);

      // Parse HTML content and filter the required data
      filterSemester(content, setSemesterData);
      setProgress(0.6);
    } catch (err) {
      setError(
        "An error occurred while navigating to the exam results. Please try again.",
      );
      console.error(err);
    }
  };

  const navigateThroughSemesters = async (
    authArguments: string,
    semesterArray: Array<{ name: string; value: string }>,
  ) => {
    setProgress(0.7);
    try {
      let allSemesterData: Array<{ name: string; html: string }> = [];

      for (const sem of semesterArray) {
        const semesterUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=COURSERESULTS&ARGUMENTS=${authArguments},-N${sem.value},-N000307`;
        const response = await axiosInstance.get(semesterUrl);
        const content = response.data;

        allSemesterData.push({ name: sem.name, html: content });

        const progressUpdate =
          0.8 + (0.2 * (semesterArray.indexOf(sem) + 1)) / semesterArray.length;
        setProgress(progressUpdate);
      }

      filterGrade(allSemesterData, setGradeData);

      setHtmlContent(JSON.stringify(allSemesterData));
    } catch (err) {
      setError(
        "An error occurred while navigating through the semesters. Please try again.",
      );
      console.error(err);
    }

    setProgress(1);
    setLoading(false);
  };

  // Wait for login data to load (this is very fast so it will most likely not be shown)
  if (isLoginLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Lade Anmeldedaten...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <Heading text="Bei Dualis anmelden" />
      <View className="items-center">
        <TextFieldInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextFieldInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <OptionSwitch
          title="Login Optionen"
          texts={["Anmeldedaten speichern"]}
          iconNames={["update"]}
          onValueChanges={[toggleSaveLogin]}
          values={[saveLogin]}
        />
        <DefaultButton text="Login" onPress={login} />
      </View>
      {loading && <Progress.Bar progress={progress} width={null} />}
      {error ? <Text className="text-red-500 mt-4">{error}</Text> : null}
      {gradeData.length > 0 ? (
        <View>
          <Heading text="Noten" />
          {gradeData.map((grade, index) => (
            <View key={index} className="mb-4">
              <Text className="text-lg font-semibold">
                {grade.number} - {grade.name}
              </Text>
              <Text>ECTS: {grade.ects}</Text>
              <Text>Note: {grade.grade}</Text>
              <Text>Status: {grade.status}</Text>
              <Text>Detail: {grade.detail}</Text>
            </View>
          ))}
        </View>
        ) : null}
      <View className="mt-4 p-4 border border-gray-300 rounded w-full">
        {semesterData.semester.length > 0
          ? semesterData.semester.map((semester, index) => (
            <View key={index} className="mb-4">
              <Text>{semester.name}</Text>
              <Text>{semester.value}</Text>
            </View>
          ))
          : null}
        <Text>ECTS: {ectsData.ectsSum}</Text>
        <Text>ECTS benötigt: {ectsData.ectsTotal}</Text>
        <Text>Gesamt-GPA: {gpaData.gpaTotal}</Text>
        <Text>Hauptfach-GPA: {gpaData.gpaSubject}</Text>
        {moduleData.length > 0
          ? moduleData.map((module, index) => (
            <View key={index} className="mb-4">
              <Text className="text-lg font-semibold">
                {module.number} - {module.name}
              </Text>
              <Text>ECTS: {module.ects}</Text>
              <Text>Note: {module.grade}</Text>
              <Text>{module.passed ? "Bestanden" : ""}</Text>
            </View>
          ))
          : null}
      </View>
    </ScrollView>
  );
};

export default Dualis;
