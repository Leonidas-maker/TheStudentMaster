// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ~~~~~~~~~~~~~ Import SVGs ~~~~~~~~~~~~~ //
import DashboardSVG from "../../public/images/svg/navigatorIcons/inactive/DashboardSVG";
import ActiveDashboardSVG from "../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG";
import DualisSVG from "../../public/images/svg/navigatorIcons/inactive/DualisSVG";
import ActiveDualisSVG from "../../public/images/svg/navigatorIcons/active/ActiveDualisSVG";
import MealPlanSVG from "../../public/images/svg/navigatorIcons/inactive/MealPlanSVG";
import ActiveMealPlanSVG from "../../public/images/svg/navigatorIcons/active/ActiveMealPlanSVG";
import OverviewSVG from "../../public/images/svg/navigatorIcons/inactive/OverviewSVG";
import ActiveOverviewSVG from "../../public/images/svg/navigatorIcons/active/ActiveOverviewSVG";

// ~~~~~~~~~~~~ Import screens ~~~~~~~~~~~ //
import OverviewStack from "./OverviewStack";
import Dashboard from "../screens/dashboard/Dashboard";
import Dualis from "../screens/dualis/Dualis";
import MealPlan from "../screens/mealPlan/MealPlan";

// Create BottomTabNavigator
const Tab = createBottomTabNavigator();

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const HomeBottomTabs: React.FC = () => {
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
    <SafeAreaProvider>
      <StatusBar barStyle={barStyle} />
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          tabBarStyle: { backgroundColor: backgroundColor },
          headerTintColor: headerTintColor,
          tabBarActiveTintColor: tabBarActiveTintColor,
          tabBarInactiveTintColor: tabBarInactiveTintColor,
        }}
      >
        <Tab.Screen
          name="Stundenplan"
          component={Dashboard}
          options={{
            headerTitle: "TheStudentMaster",
            tabBarIcon: ({ color, size, focused }) => {
              if (focused) {
                return (
                  <ActiveDashboardSVG width={size} height={size} fill={color} />
                );
              } else {
                return <DashboardSVG width={size} height={size} fill={color} />;
              }
            },
          }}
        />
        <Tab.Screen
          name="Essensplan"
          component={MealPlan}
          options={{
            headerTitle: "TheStudentMaster",
            tabBarIcon: ({ color, size, focused }) => {
              if (focused) {
                return (
                  <ActiveMealPlanSVG width={size} height={size} fill={color} />
                );
              } else {
                return <MealPlanSVG width={size} height={size} fill={color} />;
              }
            },
          }}
        />
        <Tab.Screen
          name="Weiteres"
          component={OverviewStack}
          options={{
            headerTitle: "Page navigator",
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => {
              if (focused) {
                return (
                  <ActiveOverviewSVG width={size} height={size} fill={color} />
                );
              } else {
                return <OverviewSVG width={size} height={size} fill={color} />;
              }
            },
          }}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
};

export default HomeBottomTabs;
