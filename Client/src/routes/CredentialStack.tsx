import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";
import Registration from "../screens/accountManagement/registration/Registration";
import Login from "../screens/accountManagement/login/Login";
import HomeBottomTabs from "./HomeBottomTabs";

const Stack = createStackNavigator();

const CredentialStack: React.FC = () => {
  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const backgroundColor = isLight ? "#E8EBF7" : "#1E1E24";
  const headerTintColor = isLight ? "#171717" : "#E0E2DB";
  const tabBarActiveTintColor = isLight ? "#DE1A1A" : "#ED2A1D";
  const tabBarInactiveTintColor = isLight ? "#B71515" : "#C91818";
  const barStyle = isLight ? "dark-content" : "light-content";

  return (
    <>
      <StatusBar barStyle={barStyle} />
      <Stack.Navigator
        initialRouteName="Registration"
        screenOptions={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: headerTintColor,
        }}
      >
        <Stack.Screen
          name="Settings"
          component={Registration}
          options={{ headerShown: true }}
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="HomeBottomStack" component={HomeBottomTabs} />
      </Stack.Navigator>
    </>
  );
};

export default CredentialStack;
