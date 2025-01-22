// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import DualisLogin from "../screens/dualis/DualisLogin";
import DualisLoad from "../screens/dualis/DualisLoad";
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

  // Set the icon color based on the color scheme
  const iconColor = isLight ? "#000000" : "#FFFFFF";

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
