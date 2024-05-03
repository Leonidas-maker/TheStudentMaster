import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";
import Registration from "../screens/accountManagement/registration/Registration";

const Stack = createStackNavigator();

const CredentialStack: React.FC = () => {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator
        initialRouteName="Registration"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#171717",
          },
          headerTintColor: "#E0E0E2",
        }}
      >
        <Stack.Screen
          name="Settings"
          component={Registration}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </>
  );
};

export default CredentialStack;
