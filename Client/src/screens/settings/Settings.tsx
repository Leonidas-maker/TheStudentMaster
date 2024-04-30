import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";

type SchemeType = "light" | "dark" | "system";

function Settings() {
  const { t } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [selectedScheme, setSelectedScheme] = useState<SchemeType>("system");

  useEffect(() => {
    // Aktualisiert das Farbschema basierend auf der Auswahl des Benutzers
    if (selectedScheme === "system") {
      // Hier könnte Logik implementiert werden, um auf Systemänderungen zu reagieren
      // Für den Moment wird das Systemthema nicht direkt gesetzt
    } else {
      setColorScheme(selectedScheme);
    }
  }, [selectedScheme, setColorScheme]);

  const setScheme = (scheme: SchemeType) => {
    setSelectedScheme(scheme);
  };

  const RadioOption = ({
    label,
    onPress,
    checked,
  }: {
    label: string;
    onPress: () => void;
    checked: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
      }}
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
    </TouchableOpacity>
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
          checked={selectedScheme === "light"}
        />
        <RadioOption
          label="Dark Mode"
          onPress={() => setScheme("dark")}
          checked={selectedScheme === "dark"}
        />
        <RadioOption
          label="System Mode"
          onPress={() => setScheme("system")}
          checked={selectedScheme === "system"}
        />
      </View>
    </ScrollView>
  );
}

export default Settings;
