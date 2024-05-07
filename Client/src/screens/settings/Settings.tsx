import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Pressable } from "react-native";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../provider/ThemeProvider";

type SchemeType = "light" | "dark" | "system";

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();

  const { theme, setTheme } = useTheme();

  const setScheme = (scheme: SchemeType) => {
    setTheme(scheme);
  };

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  const RadioOption = ({
    label,
    onPress,
    checked,
  }: {
    label: string;
    onPress: () => void;
    checked: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
      }}
      className="active:opacity-50"
    >
      <View
        style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: "#fff",
            }}
          />
        ) : null}
      </View>
      <Text style={{ marginLeft: 10 }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView className="h-screen bg-primary dark:bg-white">
      <View style={{ padding: 20 }}>
        <Text className="text-font_primary dark:text-fuchsia-600">
          Welcome to the Settings page
        </Text>
        <RadioOption
          label="Light Mode"
          onPress={() => setScheme("light")}
          checked={theme === "light"}
        />
        <RadioOption
          label="Dark Mode"
          onPress={() => setScheme("dark")}
          checked={theme === "dark"}
        />
        <RadioOption
          label="System Mode"
          onPress={() => setScheme("system")}
          checked={theme === "system"}
        />
      </View>
    </ScrollView>
  );
};

export default Settings;
