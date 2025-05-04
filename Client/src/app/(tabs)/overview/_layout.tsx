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
          headerTitle: "Weiteres",
        }}
      />

      <Stack.Screen
        name="(misc)/Imprint"
        options={{
          headerTitle: "Impressum",
        }}
      />
      <Stack.Screen
        name="(misc)/Licenses"
        options={{
          headerTitle: "Lizenzen",
        }}
      />
      <Stack.Screen
        name="(settings)/Settings"
        options={{
          headerTitle: "Einstellungen",
        }}
      />
      <Stack.Screen
        name="(support)/BugReport"
        options={{
          headerTitle: "Bug Report",
        }}
      />
      <Stack.Screen
        name="(support)/ResponsibleDisclosure"
        options={{
          headerTitle: "Responsible Disclosure",
        }}
      />
      <Stack.Screen
        name="(support)/Support"
        options={{
          headerTitle: "Support",
        }}
      />
    </Stack>
  );
}
