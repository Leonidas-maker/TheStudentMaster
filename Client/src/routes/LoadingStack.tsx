// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import CredentialStack from "./CredentialStack";
import MiscStack from "./MiscStack";
import Loading from "../screens/loading/Loading";
import HomeBottomTabs from "./HomeBottomTabs";
import OverviewStack from "./OverviewStack";
import Onboarding from "../screens/onboarding/Onboarding";

// Create stack
const Stack = createStackNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const LoadingStack: React.FC = () => {
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
  const backgroundColor = isLight ? "#E8EBF7" : "#1E1E24";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <>
      <StatusBar barStyle={barStyle} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: backgroundColor },
        }}
      >
        <Stack.Screen name="Loading" component={Loading} />
        <Stack.Screen name="HomeBottomTabs" component={HomeBottomTabs} />
        <Stack.Screen name="OverviewStack" component={OverviewStack} />
        <Stack.Screen name="CredentialStack" component={CredentialStack} />
        <Stack.Screen name="MiscStack" component={MiscStack} />
        <Stack.Screen name="Onboarding" component={Onboarding} />
      </Stack.Navigator>
    </>
  );
};

export default LoadingStack;
