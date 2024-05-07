import React, { useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import DashboardSVG from "../../public/images/svg/navigatorIcons/inactive/DashboardSVG";
import ActiveDashboardSVG from "../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG";
import DualisSVG from "../../public/images/svg/navigatorIcons/inactive/DualisSVG";
import ActiveDualisSVG from "../../public/images/svg/navigatorIcons/active/ActiveDualisSVG";
import MealPlanSVG from "../../public/images/svg/navigatorIcons/inactive/MealPlanSVG";
import ActiveMealPlanSVG from "../../public/images/svg/navigatorIcons/active/ActiveMealPlanSVG";
import OverviewSVG from "../../public/images/svg/navigatorIcons/inactive/OverviewSVG";
import ActiveOverviewSVG from "../../public/images/svg/navigatorIcons/active/ActiveOverviewSVG";

import Dashboard from "../screens/dashboard/Dashboard";
import Dualis from "../screens/dualis/Dualis";
import MealPlan from "../screens/mealPlan/MealPlan";
import OverviewStack from "./OverviewStack";

const Tab = createBottomTabNavigator();

const HomeBottomTabs: React.FC = () => {
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
  const tabBarActiveTintColor = isLight ? "#DE1A1A" : "#AA180E";
  const tabBarInactiveTintColor = isLight ? "#B71515" : "#800F0F";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
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
