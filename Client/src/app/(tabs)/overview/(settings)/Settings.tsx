import React, { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useFocusEffect, useRouter } from "expo-router";
import Navigator from "../../../../components/navigator/Navigator";

const Settings: React.FC = () => {
  const { t } = useTranslation("settings");
  const router = useRouter();

  // ====================================================== //
  // ================== SettingsNavigator ================= //
  // ====================================================== //
  const handleCoursePress = () => {
    router.navigate("/(tabs)/overview/(settings)/CourseSettings");
  };

  const handleThemePress = () => {
    router.navigate("/(tabs)/overview/(settings)/ThemeSettings");
  };

  const handleLanguagePress = () => {
    router.navigate("/(tabs)/overview/(settings)/LanguageSettings");
  };

  const moduleTitle = t("settingsPageNavigator_title1");

  const onPressModuleFunctions = [
    handleCoursePress,
    handleThemePress,
    handleLanguagePress,
  ];

  const moduleTexts = [
    t("settings_course_btn"),
    t("settings_theme_btn"),
    t("settings_lang_btn"),
  ];

  const moduleIconNames = ["view-timeline", "contrast", "language"];

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <Navigator
        title={moduleTitle}
        onPressFunctions={onPressModuleFunctions}
        texts={moduleTexts}
        iconNames={moduleIconNames}
      />
    </ScrollView>
  );
};

export default Settings;
