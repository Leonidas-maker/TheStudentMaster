// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { expo } from "../../../app.json";
import { Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import ProfileView from "../../components/profileView/ProfileView";
import Navigator from "../../components/navigator/Navigator";
import DefaultText from "../../components/textFields/DefaultText";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Overview: React.FC = () => {
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  // ====================================================== //
  // ================== AccountNavigator ================== //
  // ====================================================== //
  // Defines the press functions
  const handleLoginPagePress = () => {
    navigation.navigate("OverviewStack", { screen: "Login" });
  };

  const handleRegistrationPress = () => {
    navigation.navigate("OverviewStack", { screen: "Registration" });
  };

  const handleForgotPress = () => {
    navigation.navigate("OverviewStack", { screen: "ForgotPassword" });
  };

  const handleAddMFAPress = () => {
    navigation.navigate("OverviewStack", { screen: "AddMFA" });
  };

  const handleVerifyLoginPress = () => {
    navigation.navigate("OverviewStack", { screen: "VerifyLogin" });
  };

  const handleVerifyRegistrationPress = () => {
    navigation.navigate("OverviewStack", { screen: "VerifyRegistration" });
  };

  const handleVerifyMFAPress = () => {
    navigation.navigate("OverviewStack", { screen: "VerifyMFA" });
  };

  const handleNewPasswordPress = () => {
    navigation.navigate("OverviewStack", { screen: "NewPassword" });
  };

  const handleVerifyForgotPress = () => {
    navigation.navigate("OverviewStack", { screen: "VerifyForgot" });
  };

  const handleProflePress = () => {
    navigation.navigate("OverviewStack", { screen: "Profile" });
  };

  const handleBackupPress = () => {
    navigation.navigate("OverviewStack", { screen: "BackupMFA" });
  };

  const handleLoadingPress = () => {
    navigation.navigate("OverviewStack", { screen: "Loading" });
  };

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

    SecureStore.deleteItemAsync("access_token");
    SecureStore.deleteItemAsync("refresh_token");
    SecureStore.deleteItemAsync("secret_token");

    console.log("Storage cleared");
  };

  // Sets the navigator title
  const accountTitle = "Account Management Screens";

  // Sets the press functions
  const onPressAccountFunctions = [
    handleLoadingPress,
    handleLoginPagePress,
    handleRegistrationPress,
    handleForgotPress,
    handleVerifyForgotPress,
    handleNewPasswordPress,
    handleAddMFAPress,
    handleVerifyMFAPress,
    handleVerifyLoginPress,
    handleVerifyRegistrationPress,
    handleBackupPress,
    handleProflePress,
    handleDeletePress,
  ];

  // Sets the texts for the navigator
  const accountTexts = [
    "Loading",
    "Login",
    "Registration",
    "Forgot Password",
    "Verify Forgot",
    "New Password",
    "Add MFA",
    "Verify MFA",
    "Verify Login",
    "Verify Registration",
    "Backup MFA",
    "Profile",
    "Delete Storage",
  ];

  // Sets the icons for the navigator
  const accountIconNames = [
    "hourglass-empty",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
    "apps",
  ];

  // ====================================================== //
  // =================== ModuleNavigator ================== //
  // ====================================================== //
  const handleDashboardPress = () => {
    navigation.navigate("OverviewStack", { screen: "Dashboard" });
  };

  const handleDualisPress = () => {
    navigation.navigate("OverviewStack", { screen: "Dualis" });
  };

  const handleMealPlanPress = () => {
    navigation.navigate("MealPlan");
  };

  const moduleTitle = "Weitere Funktionen";

  const onPressModuleFunctions = [handleMealPlanPress];

  const moduleTexts = ["Essensplan"];

  const moduleIconNames = ["restaurant"];

  // ====================================================== //
  // ================== OverviewNavigator ================= //
  // ====================================================== //
  //! Placeholder for testing if logout can be set to invisble and visible
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  const handleSettingsPress = () => {
    navigation.navigate("MiscStack", { screen: "Settings" });
  };

  const handleImprintPress = () => {
    navigation.navigate("MiscStack", { screen: "Imprint" });
  };

  const handleCreditsPress = () => {
    navigation.navigate("MiscStack", { screen: "Licenses" });
  };

  const handleDisclosurePress = () => {
    navigation.navigate("MiscStack", { screen: "ResponsibleDisclosure" });
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
    navigation.navigate("MiscStack", { screen: "Support" });
  };

  const handleBugReportPress = () => {
    navigation.navigate("MiscStack", { screen: "BugReport" });
  };

  const overviewTitle = "Weitere Inhalte";

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
    "Einstellungen",
    "Support",
    "Bug Report",
    "Responsible Disclosure",
    "Lizenzen",
    "GitLab",
    "GitHub",
    "Impressum",
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
  // =================== DualisNavigator ================== //
  // ====================================================== //
  const handleDualisLoginPress = () => {
    navigation.navigate("OverviewStack", { screen: "DualisLogin" });
  };

  const handleDualisLoadPress = () => {
    navigation.navigate("OverviewStack", { screen: "DualisDummy" });
  };

  const handleDualisPerformancePress = () => {
    navigation.navigate("OverviewStack", { screen: "Dualis" });
  };

  const handleDualisSemesterPress = () => {
    navigation.navigate("OverviewStack", { screen: "DualisSemester" });
  };

  const dualisTitle = "Dualis Screens";

  const onPressDualisFunctions = [
    handleDualisLoginPress,
    handleDualisLoadPress,
    handleDualisPerformancePress,
    handleDualisSemesterPress,
  ];

  const dualisTexts = [
    "Login",
    "Load",
    "Performance Overview",
    "Semester View",
  ];

  const dualisIcons = ["apps", "apps", "apps", "apps"];

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
      {/* <Navigator
        title={dualisTitle}
        onPressFunctions={onPressDualisFunctions}
        texts={dualisTexts}
        iconNames={dualisIcons}
      /> */}
      <Navigator
        title={overviewTitle}
        onPressFunctions={onPressOverviewFunctions}
        texts={overviewTexts}
        iconNames={moduleIcons}
        isExternalLink={moduleIsExternalLink}
      />
      <View className="justify-center items-center my-2">
        <DefaultText text={`App Version: ${expo.version} ❤️`} />
      </View>
    </ScrollView>
  );
};

export default Overview;
