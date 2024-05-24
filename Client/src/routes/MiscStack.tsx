import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";
import Settings from "../screens/settings/Settings";
import Imprint from "../screens/imprint/Imprint";
import ResponsibleDisclosure from "../screens/responsibleDisclosure/ResponsibleDisclosure";
import Credits from "../screens/credits/Credits";

const Stack = createStackNavigator();

const MiscStack: React.FC = () => {
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
          options={{ headerShown: true, headerBackTitle: "Weiteres" }}
        />
        <Stack.Screen
          name="Imprint"
          component={Imprint}
          options={{ headerShown: true, headerBackTitle: "Weiteres" }}
        />
        <Stack.Screen
          name="ResponsibleDisclosure"
          component={ResponsibleDisclosure}
          options={{ headerShown: true, headerBackTitle: "Weiteres" }}
        />
        <Stack.Screen
          name="Credits"
          component={Credits}
          options={{ headerShown: true, headerBackTitle: "Weiteres" }}
        />
      </Stack.Navigator>
    </>
  );
};

export default MiscStack;