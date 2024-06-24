// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar, useColorScheme } from "react-native";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import Dashboard from "../screens/dashboard/Dashboard";
import Loading from "../screens/loading/Loading";
import Overview from "../screens/overview/Overview";
import Dualis from "../screens/dualis/Dualis";
import MealPlan from "../screens/mealPlan/MealPlan";
import Settings from "../screens/settings/Settings";
import Imprint from "../screens/imprint/Imprint";
import Credits from "../screens/licenses/Licenses";
import Profile from "../screens/profile/Profile";
import ResponsibleDisclosure from "../screens/responsibleDisclosure/ResponsibleDisclosure";
import Login from "../screens/accountManagement/login/Login";
import Registration from "../screens/accountManagement/registration/Registration";
import ForgotPassword from "../screens/accountManagement/forgotPassword/ForgotPassword";
import AddMfa from "../screens/accountManagement/mfa/AddMfa";
import VerifyLogin from "../screens/accountManagement/login/VerifyLogin";
import VerifyRegistration from "../screens/accountManagement/registration/VerifyRegistration";
import VerifyMfa from "../screens/accountManagement/mfa/VerifyMfa";
import NewPassword from "../screens/accountManagement/forgotPassword/NewPassword";
import VerifyForgot from "../screens/accountManagement/forgotPassword/VerifyForgot";
import BackupMfa from "../screens/accountManagement/mfa/BackupMfa";

// Create Stack
const Stack = createStackNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const OverviewStack: React.FC = () => {
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
  const tabBarActiveTintColor = isLight ? "#DE1A1A" : "#ED2A1D";
  const tabBarInactiveTintColor = isLight ? "#B71515" : "#C91818";
  const barStyle = isLight ? "dark-content" : "light-content";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <>
      <StatusBar barStyle={barStyle} />
      <Stack.Navigator
        initialRouteName="Overview"
        screenOptions={{
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: headerTintColor,
        }}
      >
        <Stack.Screen
          name="Overview"
          component={Overview}
          options={{ headerShown: true, headerTitle: "Weiteres" }}
        />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Loading" component={Loading} />
        <Stack.Screen name="Dualis" component={Dualis} />
        <Stack.Screen name="MealPlan" component={MealPlan} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Imprint" component={Imprint} />
        <Stack.Screen name="Credits" component={Credits} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen
          name="ResponsibleDisclosure"
          component={ResponsibleDisclosure}
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="AddMFA" component={AddMfa} />
        <Stack.Screen name="VerifyLogin" component={VerifyLogin} />
        <Stack.Screen
          name="VerifyRegistration"
          component={VerifyRegistration}
        />
        <Stack.Screen name="VerifyMFA" component={VerifyMfa} />
        <Stack.Screen name="NewPassword" component={NewPassword} />
        <Stack.Screen name="VerifyForgot" component={VerifyForgot} />
        <Stack.Screen name="BackupMfa" component={BackupMfa} />
      </Stack.Navigator>
    </>
  );
};

export default OverviewStack;
