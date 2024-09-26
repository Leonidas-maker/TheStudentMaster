// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import axios from "axios";
import { Parser } from "htmlparser2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import TextFieldInput from "../../components/textInputs/TextFieldInput";
import DefaultButton from "../../components/buttons/DefaultButton";
import Heading from "../../components/textFields/Heading";
import OptionSwitch from "../../components/switch/OptionSwitch";

import { filterHtmlContent } from "../../scraper/dualis/performanceOverviewScraper";

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
  const [moduleData, setModuleData] = useState<
    Array<{
      number: string;
      name: string;
      ects: string;
      note: string;
      passed: boolean;
    }>
  >([]);
  const [saveLogin, setSaveLogin] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(true);

  // Function to save login credentials
  const saveCredentials = async () => {
    try {
      await AsyncStorage.setItem("dualisUsername", username);
      await SecureStore.setItemAsync("dualisPassword", password);
    } catch (err) {
      console.error("Error saving credentials", err);
    }
  };

  // Function to remove login credentials
  const removeCredentials = async () => {
    try {
      await AsyncStorage.removeItem("dualisUsername");
      await SecureStore.deleteItemAsync("dualisPassword");
    } catch (err) {
      console.error("Error removing credentials", err);
    }
  };

  // Load saveLogin state from AsyncStorage when component mounts
  useEffect(() => {
    const loadSaveLoginState = async () => {
      try {
        const savedSaveLogin = await AsyncStorage.getItem("saveDualisLogin");
        if (savedSaveLogin !== null) {
          setSaveLogin(JSON.parse(savedSaveLogin)); // Convert string back to boolean
        }
      } catch (err) {
        console.error("Error loading saveLogin state", err);
      }
    };

    loadSaveLoginState();
  }, []);

  // Save saveLogin state to AsyncStorage when it changes
  useEffect(() => {
    const saveSaveLoginState = async () => {
      try {
        await AsyncStorage.setItem(
          "saveDualisLogin",
          JSON.stringify(saveLogin),
        ); // Convert boolean to string
      } catch (err) {
        console.error("Error saving saveLogin state", err);
      }
    };

    saveSaveLoginState();
  }, [saveLogin]);

  // Load saved credentials when component mounts
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem("dualisUsername");
        const savedPassword = await SecureStore.getItemAsync("dualisPassword");

        if (savedUsername) setUsername(savedUsername);
        if (savedPassword) setPassword(savedPassword);
      } catch (err) {
        console.error("Error loading credentials", err);
      } finally {
        setIsLoginLoading(false); // Set loading state to false after loading credentials
      }
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

      setError("");
      navigateToPerformanceOverview(
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

  const extractAuthArguments = (refreshHeader: string) => {
    if (refreshHeader) {
      return refreshHeader.slice(84).replace("-N000000000000000", "");
    }
    return "";
  };

  const navigateToPerformanceOverview = async (authArguments: string) => {
    try {
      const performanceUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=STUDENT_RESULT&ARGUMENTS=${authArguments},-N000310,-N0,-N000000000000000,-N000000000000000,-N000000000000000,-N0,-N000000000000000`;
      const response = await axiosInstance.get(performanceUrl);
      const content = response.data;

      // Set HTML content state
      setHtmlContent(content);
      // Parse HTML content and filter the required data
      filterHtmlContent(content, setModuleData);
    } catch (err) {
      setError(
        "An error occurred while navigating to the performance overview. Please try again.",
      );
      console.error(err);
    }
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
      {error ? <Text className="text-red-500 mt-4">{error}</Text> : null}
      <View className="mt-4 p-4 border border-gray-300 rounded w-full">
        {moduleData.length > 0 ? (
          moduleData.map((module, index) => (
            <View key={index} className="mb-4">
              <Text className="text-lg font-semibold">
                {module.number} - {module.name}
              </Text>
              <Text>ECTS: {module.ects}</Text>
              <Text>Note: {module.note}</Text>
              <Text>{module.passed ? "Bestanden" : ""}</Text>
            </View>
          ))
        ) : (
          <DefaultText text={htmlContent} />
        )}
      </View>
    </ScrollView>
  );
};

export default Dualis;
