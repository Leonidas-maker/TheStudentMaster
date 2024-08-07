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

// Create Stack
const Stack = createStackNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const MiscStack: React.FC = () => {
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
        initialRouteName="Settings"
        screenOptions={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: headerTintColor,
        }}
      >
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Einstellungen",
          }}
        />
        <Stack.Screen
          name="Imprint"
          component={Imprint}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Impressum",
          }}
        />
        <Stack.Screen
          name="ResponsibleDisclosure"
          component={ResponsibleDisclosure}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Responsible Disclosure",
          }}
        />
        <Stack.Screen
          name="Licenses"
          component={Credits}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Lizenzen",
          }}
        />
        <Stack.Screen
          name="Support"
          component={Support}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Support",
          }}
        />
        <Stack.Screen
          name="BugReport"
          component={BugReport}
          options={{
            headerShown: true,
            headerBackTitle: "Weiteres",
            headerTitle: "Bug Report",
          }}
        />
      </Stack.Navigator>
    </>
  );
};

export default MiscStack;
