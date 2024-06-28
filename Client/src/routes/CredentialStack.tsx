// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import HomeBottomTabs from "./HomeBottomTabs";
import Registration from "../screens/accountManagement/registration/Registration";
import Login from "../screens/accountManagement/login/Login";
import ForgotPassword from "../screens/accountManagement/forgotPassword/ForgotPassword";
import NewPassword from "../screens/accountManagement/forgotPassword/NewPassword";
import VerifyForgot from "../screens/accountManagement/forgotPassword/VerifyForgot";
import VerifyLogin from "../screens/accountManagement/login/VerifyLogin";
import AddMfa from "../screens/accountManagement/mfa/AddMfa";
import BackupMfa from "../screens/accountManagement/mfa/BackupMfa";
import VerifyMfa from "../screens/accountManagement/mfa/VerifyMfa";
import VerifyRegistration from "../screens/accountManagement/registration/VerifyRegistration";
import Profile from "../screens/profile/Profile";

// Create stack
const Stack = createStackNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const CredentialStack: React.FC = () => {
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
  const backgroundColor = isLight ? "#E8EBF7" : "#1E1E24";
  const headerTintColor = isLight ? "#171717" : "#E0E2DB";
  // For future use
  //const tabBarActiveTintColor = isLight ? "#DE1A1A" : "#ED2A1D";
  //const tabBarInactiveTintColor = isLight ? "#B71515" : "#C91818";
  //const barStyle = isLight ? "dark-content" : "light-content";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <>
      <StatusBar style="auto" />
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
          name="Registration"
          component={Registration}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: true, headerBackTitle: "Weiteres" }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPassword}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="NewPassword"
          component={NewPassword}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="VerifyForgot"
          component={VerifyForgot}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="VerifyLogin"
          component={VerifyLogin}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="AddMfa"
          component={AddMfa}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="BackupMfa"
          component={BackupMfa}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="VerifyMfa"
          component={VerifyMfa}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="VerifyRegistration"
          component={VerifyRegistration}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: true, headerBackTitle: "Weiteres" }}
        />
        <Stack.Screen name="HomeBottomStack" component={HomeBottomTabs} />
      </Stack.Navigator>
    </>
  );
};

export default CredentialStack;
