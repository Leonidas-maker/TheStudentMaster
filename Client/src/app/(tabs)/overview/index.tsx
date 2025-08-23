// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { expo } from "../../../../app.json";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import ProfileView from "../../../components/profileView/ProfileView";
import Navigator from "../../../components/navigator/Navigator";
import DefaultText from "../../../components/textFields/DefaultText";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Overview: React.FC = () => {
  const { t } = useTranslation("overview");
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const router = useRouter();

  // ====================================================== //
  // ================== AccountNavigator ================== //
  // ====================================================== //
  // Defines the press functions

  const handleDeletePress = () => {
    AsyncStorage.removeItem("events");
    AsyncStorage.removeItem("lastFetchTime");
    AsyncStorage.removeItem("selectedUniversity");
    AsyncStorage.removeItem("selectedCourse");
    AsyncStorage.removeItem("lastFetchHash");
    AsyncStorage.removeItem("canteens");
    AsyncStorage.removeItem("menu");
    AsyncStorage.removeItem("lastFetchTimeCanteen");
    AsyncStorage.removeItem("onboarding");
    AsyncStorage.removeItem("appLanguage");

    SecureStore.deleteItemAsync("access_token");
    SecureStore.deleteItemAsync("refresh_token");
    SecureStore.deleteItemAsync("secret_token");

    console.log("Storage cleared");
  };

  // Sets the navigator title
  const accountTitle = "Account Management Screens";

  // Sets the press functions
  const onPressAccountFunctions = [handleDeletePress];

  // Sets the texts for the navigator
  const accountTexts = ["Delete Storage"];

  // Sets the icons for the navigator
  const accountIconNames = ["apps"];

  // ====================================================== //
  // =================== ModuleNavigator ================== //
  // ====================================================== //
  //TODO: Change for later use if some modules are disabled
  const handleFreeRoomsPress = () => {
    router.push("/(tabs)/overview/(modules)/FreeRooms");
  };

  const moduleTitle = t("more_functions_title");

  const onPressModuleFunctions = [handleFreeRoomsPress];

  const moduleTexts = [t("free_rooms_btn")];

  const moduleIconNames = ["meeting-room"];

  // ====================================================== //
  // ================== OverviewNavigator ================= //
  // ====================================================== //
  //! Placeholder for testing if logout can be set to invisble and visible
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  const handleSettingsPress = () => {
    router.push("/(tabs)/overview/(settings)/Settings");
  };

  const handleImprintPress = () => {
    router.push("/(tabs)/overview/(misc)/Imprint");
  };

  const handleCreditsPress = () => {
    router.push("/(tabs)/overview/(misc)/Licenses");
  };

  const handleDisclosurePress = () => {
    router.push("/(tabs)/overview/(support)/ResponsibleDisclosure");
  };

  const handleGitLabPress = () => {
    Linking.openURL("https://gitlab.com/themastercollection/thestudentmaster");
  };

  const handleGitHubPress = () => {
    Linking.openURL("https://github.com/Leonidas-maker/TheStudentMaster");
  };

  const handleMasterCollectionPress = () => {
    Linking.openURL("https://themastercollection.de");
  };

  const handleSupportPress = () => {
    router.push("/(tabs)/overview/(support)/Support");
  };

  const handleBugReportPress = () => {
    router.push("/(tabs)/overview/(support)/BugReport");
  };

  const overviewTitle = t("overviewPageNavigator_title1");

  const onPressOverviewFunctions = [
    handleSettingsPress,
    handleSupportPress,
    handleBugReportPress,
    handleDisclosurePress,
    handleCreditsPress,
    handleGitLabPress,
    handleGitHubPress,
    handleImprintPress,
  ];

  const overviewTexts = [
    t("settings_btn"),
    t("support_btn"),
    t("bug_report_btn"),
    t("responsible_disclosure_btn"),
    t("licenses_btn"),
    t("gitlab_btn"),
    t("github_btn"),
    t("imprint_btn"),
  ];

  //! Icons for GitLab, GitHub and TheMasterCollection need change
  const moduleIcons = [
    "settings",
    "support",
    "bug-report",
    "bug-report",
    "attribution",
    "lightbulb",
    "lightbulb",
    "article",
  ];

  const moduleIsExternalLink = [
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
  ];

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  // Returns the navigators and the current app version
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      {/* <ProfileView /> */}
      <Navigator
        title={moduleTitle}
        onPressFunctions={onPressModuleFunctions}
        texts={moduleTexts}
        iconNames={moduleIconNames}
      />
      {/* <Navigator
        title={accountTitle}
        onPressFunctions={onPressAccountFunctions}
        texts={accountTexts}
        iconNames={accountIconNames}
      /> */}
      <Navigator
        title={overviewTitle}
        onPressFunctions={onPressOverviewFunctions}
        texts={overviewTexts}
        iconNames={moduleIcons}
        isExternalLink={moduleIsExternalLink}
      />
      <View className="justify-center items-center my-2">
        <DefaultText text={t("app_version", { version: expo.version })} />
      </View>
    </ScrollView>
  );
};

export default Overview;
