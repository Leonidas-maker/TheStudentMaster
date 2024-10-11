// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import Settings from "../screens/settings/Settings";
import Imprint from "../screens/imprint/Imprint";
import ResponsibleDisclosure from "../screens/responsibleDisclosure/ResponsibleDisclosure";
import Credits from "../screens/licenses/Licenses";
import Support from "../screens/support/Support";
import BugReport from "../screens/bugReport/BugReport";
import DualisLogin from "../screens/dualis/DualisLogin";
import DualisLoad from "../screens/dualis/DualisLoad";
import DualisSemester from "../screens/dualis/DualisSemester";
import Dualis from "../screens/dualis/Dualis";

// Create Stack
const Stack = createStackNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DualisStack: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [isLight, setIsLight] = useState(false);

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Check if the color scheme is light or dark
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // Set the colors based on the color scheme
  const headerTintColor = isLight ? "#171717" : "#E0E2DB";
  const backgroundColor = isLight ? "#E8EBF7" : "#1E1E24";
  // For future use
  // const barStyle = isLight ? "dark-content" : "light-content";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="DualisLogin"
        screenOptions={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerShown: false,
          headerTintColor: headerTintColor,
        }}
      >
        <Stack.Screen
          name="DualisLogin"
          component={DualisLogin}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "TheStudentMaster",
          }}
        />
        <Stack.Screen
          name="DualisLoad"
          component={DualisLoad}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Dualis",
          }}
        />
        <Stack.Screen
          name="DualisSemester"
          component={DualisSemester}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Dualis",
          }}
        />
        <Stack.Screen
          name="DualisPerfomance"
          component={Dualis}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Dualis",
          }}
        />
      </Stack.Navigator>
    </>
  );
};

export default DualisStack;
