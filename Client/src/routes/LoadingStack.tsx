import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Loading from "../screens/loading/Loading";
import HomeBottomTabs from "./HomeBottomTabs";
import OverviewStack from "./OverviewStack";
import { StatusBar, useColorScheme } from "react-native";
import CredentialStack from "./CredentialStack";
import MiscStack from "./MiscStack";
import Onboarding from "../screens/onboarding/Onboarding";

const Stack = createStackNavigator();

const LoadingStack: React.FC = () => {
  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const barStyle = isLight ? "dark-content" : "light-content";
  const backgroundColor = isLight ? "#E8EBF7" : "#1E1E24";

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
