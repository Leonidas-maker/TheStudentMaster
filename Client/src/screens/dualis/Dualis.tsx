// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import axios from "axios";
import { Parser } from "htmlparser2"; // Import htmlparser2

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [error, setError] = useState("");
  const [moduleData, setModuleData] = useState<Array<{ number: string; name: string; ects: string; note: string; passed: boolean }>>([]);

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
      filterHtmlContent(content);
    } catch (err) {
      setError("An error occurred while navigating to the performance overview. Please try again.");
      console.error(err);
    }
  };

  // Function to filter HTML content and extract the desired data
  const filterHtmlContent = (html: string) => {
    const extractedModules: Array<{ number: string; name: string; ects: string; note: string; passed: boolean }> = [];
    let currentModule = { number: "", name: "", ects: "", note: "", passed: false };
    let currentTdIndex = 0;
    let insideClassTr = false;
    let insideAnchorTag = false;
  
    const parser = new Parser({
      onopentag(name, attribs) {
        if (name === "tr" && !attribs.class?.includes("subhead")) {
          currentTdIndex = 0;
          insideClassTr = true;
          currentModule = { number: "", name: "", ects: "", note: "", passed: false }; // Reset module
        }
  
        // Check if we are inside an anchor tag (either for module name or passed status)
        insideAnchorTag = name === "a" && attribs.id?.startsWith("result_id_");
  
        // Set module as passed if an image with title "Bestanden" is found
        if (name === "img" && attribs.title === "Bestanden") {
          currentModule.passed = true;
        }
      },
      ontext(text) {
        const cleanText = text.trim();
        if (!cleanText || !insideClassTr) return; // Skip empty text or if not inside the relevant row
  
        if (insideAnchorTag) {
          currentModule.name = cleanText; // Extract module name from <a> tag
        } else {
          // Handle the text based on current index within the row
          switch (currentTdIndex) {
            case 0:
              currentModule.number = cleanText; // Module number
              break;
            case 1:
              if (!currentModule.name) currentModule.name = cleanText; // Fallback for module name directly in <td>
              break;
            case 3:
              currentModule.ects = cleanText; // ECTS points
              break;
            case 4:
              currentModule.note = cleanText; // Grade
              break;
          }
        }
      },
      onclosetag(tagname) {
        if (tagname === "td") currentTdIndex++; // Move to next <td> in the row
  
        if (tagname === "tr" && insideClassTr) {
          if (currentModule.name) extractedModules.push({ ...currentModule }); // Only add module if name exists
          insideClassTr = false; // Reset after processing the row
        }
      },
    });
  
    parser.write(html);
    parser.end();
  
    setModuleData(extractedModules);
  };  
  
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
        {moduleData.length > 0 ? (
          moduleData.map((module, index) => (
            <View key={index} className="mb-4">
              <Text className="text-lg font-semibold">{module.number} - {module.name}</Text>
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