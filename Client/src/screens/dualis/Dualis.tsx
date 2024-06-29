// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import axios from "axios";
import { load } from "cheerio";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import TextFieldInput from "../../components/textInputs/TextFieldInput";
import DefaultButton from "../../components/buttons/DefaultButton";
import Heading from "../../components/textFields/Heading";

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
  // State hooks for managing form inputs, HTML content, and errors
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");

  // Function to handle login
  const login = async () => {
    try {
      const url = `${BASE_URL}/scripts/mgrqispi.dll`;

      // Prepare form data for the login request
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

      // Make a POST request to the login URL with form data
      const response = await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const content = response.data;
      const status = response.status;

      // Check if login was successful
      if (status !== 200 || content.length > 500) {
        setError("Login failed. Please check your credentials.");
        return;
      }

      // Reset error and navigate to performance overview
      setError("");
      navigateToPerformanceOverview(extractAuthArguments(response.headers["refresh"]));
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  // Function to extract authentication arguments from the refresh header
  const extractAuthArguments = (refreshHeader: string) => {
    if (refreshHeader) {
      return refreshHeader.slice(84).replace("-N000000000000000", "");
    }
    return "";
  };

  // Function to navigate to performance overview and fetch HTML content
  const navigateToPerformanceOverview = async (authArguments: string) => {
    try {
      // URL to navigate to performance overview
      const performanceUrl = `${BASE_URL}/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=STUDENT_RESULT&ARGUMENTS=${authArguments},-N000310,-N0,-N000000000000000,-N000000000000000,-N000000000000000,-N0,-N000000000000000`;
      const response = await axiosInstance.get(performanceUrl);
      const content = response.data;

      // Set HTML content state
      setHtmlContent(content);
      console.log(content);
    } catch (err) {
      setError(
        "An error occurred while navigating to the performance overview. Please try again.",
      );
      console.error(err);
    }
  };

  // Render component
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
        <DefaultButton text="Login" onPress={login} />
      </View>
      {error ? <Text className="text-red-500 mt-4">{error}</Text> : null}
      <View className="mt-4 p-4 border border-gray-300 rounded w-full">
        <DefaultText text={htmlContent} />
      </View>
    </ScrollView>
  );
};

export default Dualis;