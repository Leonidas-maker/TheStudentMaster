import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { Alert, Button } from "react-native";

export default function DualisLayout() {
  const [isLight, setIsLight] = useState(false);
  const { t } = useTranslation("router");

  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const backgroundColor = isLight ? "#E8EBF7" : "#1E1E24";
  const headerTintColor = isLight ? "#171717" : "#E0E2DB";

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: backgroundColor,
        },
        headerTintColor: headerTintColor,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: t("overview_tab"),
        }}
      />

      <Stack.Screen
        name="(misc)/Imprint"
        options={{
          headerTitle: t("imprint_header"),
        }}
      />
      <Stack.Screen
        name="(misc)/Licenses"
        options={{
          headerTitle: t("licenses_header"),
        }}
      />
      <Stack.Screen
        name="(settings)/Settings"
        options={{
          headerTitle: t("settings_header"),
        }}
      />
      <Stack.Screen
        name="(settings)/ThemeSettings"
        options={{
          headerTitle: t("theme_settings_header"),
        }}
      />
      <Stack.Screen
        name="(settings)/CourseSettings"
        options={{
          headerTitle: t("course_settings_header"),
        }}
      />
      <Stack.Screen
        name="(settings)/LanguageSettings"
        options={{
          headerTitle: t("language_settings_header"),
        }}
      />
      <Stack.Screen
        name="(support)/BugReport"
        options={{
          headerTitle: t("bug_report_header"),
        }}
      />
      <Stack.Screen
        name="(support)/ResponsibleDisclosure"
        options={{
          headerTitle: t("responsible_disclosure_header"),
        }}
      />
      <Stack.Screen
        name="(support)/Support"
        options={{
          headerTitle: t("support_header"),
        }}
      />
      <Stack.Screen
        name="(modules)/FreeRooms"
        options={{
          headerTitle: t("free_rooms_header"),
        }}
      />
    </Stack>
  );
}
