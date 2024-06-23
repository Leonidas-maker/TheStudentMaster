// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import Settings from "../screens/settings/Settings";
import Imprint from "../screens/imprint/Imprint";
import ResponsibleDisclosure from "../screens/responsibleDisclosure/ResponsibleDisclosure";
import Credits from "../screens/licenses/Licenses";

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
  const barStyle = isLight ? "dark-content" : "light-content";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <>
      <StatusBar barStyle={barStyle} />
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
      </Stack.Navigator>
    </>
  );
};

export default MiscStack;
