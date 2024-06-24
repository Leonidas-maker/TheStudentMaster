// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import Settings from "../screens/settings/Settings";

// Create Stack
const Stack = createStackNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const SettingsStack: React.FC = () => {
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
            backgroundColor: "#171717",
          },
          headerTintColor: "#E0E0E2",
        }}
      >
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </>
  );
};

export default SettingsStack;
