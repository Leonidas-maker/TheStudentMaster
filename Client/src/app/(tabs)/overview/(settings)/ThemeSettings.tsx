import React, { useState, useEffect } from "react";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../../../provider/ThemeProvider";
import { View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import OptionSelector from "../../../../components/optionSelector/OptionSelector";

const ThemeSettings: React.FC = () => {
  const [isLight, setIsLight] = useState(false);

  const { theme, setTheme } = useTheme();
  const { t } = useTranslation("settings");

  // ~~~~~~~~~~~~~~ Use Color Scheme ~~~~~~~~~~~~~~ //
  const { colorScheme, setColorScheme } = useColorScheme();

  // Set the color scheme
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  // Set if the theme is light or dark
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // Color based on the theme
  const radioColor = isLight ? "#171717" : "#E0E2DB";

  const handleLightPress = () => setTheme("light");
  const handleDarkPress = () => setTheme("dark");
  const handleSystemPress = () => setTheme("system");

  const themeSelectorTitle = t("settings_theme_selector");

  const onPressThemeFunctions = [
    handleLightPress,
    handleDarkPress,
    handleSystemPress,
  ];

  const themeTexts = [t("light_mode"), t("dark_mode"), t("system_mode")];

  const themeIconNames = ["light-mode", "dark-mode", "smartphone"];

  const checkedTheme = [
    theme === "light",
    theme === "dark",
    theme === "system",
  ];

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <OptionSelector
        title={themeSelectorTitle}
        texts={themeTexts}
        iconNames={themeIconNames}
        onPressFunctions={onPressThemeFunctions}
        checked={checkedTheme}
      />
    </ScrollView>
  );
};

export default ThemeSettings;
