import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";
import Settings from "../screens/settings/Settings";

const Stack = createStackNavigator();

const SettingsStack: React.FC = () => {
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
