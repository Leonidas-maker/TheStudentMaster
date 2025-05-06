import { Stack, Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { useColorScheme } from "nativewind";
import { ThemeProvider } from "../../provider/ThemeProvider";
import ActiveDashboardSVG from "../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG";
import DashboardSVG from "../../../public/images/svg/navigatorIcons/inactive/DashboardSVG";
import ActiveDualisSVG from "../../../public/images/svg/navigatorIcons/active/ActiveDualisSVG";
import DualisSVG from "../../../public/images/svg/navigatorIcons/inactive/DualisSVG";
import ActiveMealPlanSVG from "../../../public/images/svg/navigatorIcons/active/ActiveMealPlanSVG";
import MealPlanSVG from "../../../public/images/svg/navigatorIcons/inactive/MealPlanSVG";
import ActiveOverviewSVG from "../../../public/images/svg/navigatorIcons/active/ActiveOverviewSVG";
import OverviewSVG from "../../../public/images/svg/navigatorIcons/inactive/OverviewSVG";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const [isLight, setIsLight] = useState(false);
  //TODO: Add login logic
  const { t } = useTranslation("router");

  //const { authState } = useAuth();
  //const { isLoggedIn, isVerified, isAdmin } = authState;

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const { colorScheme } = useColorScheme();

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

  return (
    <ThemeProvider>
      <Tabs
        //key={`${isLoggedIn}-${isVerified}-${isAdmin}`} // This forces a remount when auth state changes
        backBehavior="history"
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
        <Tabs.Screen
          name="index" // Dashboard
          options={{
            headerTitle: "TheStudentMaster",
            tabBarLabel: t("dashboard_tab"),
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <ActiveDashboardSVG width={size} height={size} fill={color} />
              ) : (
                <DashboardSVG width={size} height={size} fill={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="meal"
          options={{
            headerTitle: "TheStudentMaster",
            tabBarLabel: t("meal_tab"),
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <ActiveMealPlanSVG width={size} height={size} fill={color} />
              ) : (
                <MealPlanSVG width={size} height={size} fill={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="dualis"
          options={{
            headerTitle: "TheStudentMaster",
            tabBarLabel: t("dualis_tab"),
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <ActiveDualisSVG width={size} height={size} fill={color} />
              ) : (
                <DualisSVG width={size} height={size} fill={color} />
              ),
          }}
        />
        <Tabs.Screen
          name="overview"
          options={{
            headerTitle: t("overview_tab"),
            tabBarLabel: t("overview_tab"),
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <ActiveOverviewSVG width={size} height={size} fill={color} />
              ) : (
                <OverviewSVG width={size} height={size} fill={color} />
              ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  );
}
