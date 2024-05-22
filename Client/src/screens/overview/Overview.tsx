import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { expo } from "../../../app.json";
import { Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import ProfileView from "../../components/profileView/ProfileView";
import Navigator from "../../components/navigator/Navigator";
import DefaultText from "../../components/textFields/DefaultText";

const Overview: React.FC = () => {
  const navigation = useNavigation<any>();

  // ====================================================== //
  // ================== AccountNavigator ================== //
  // ====================================================== //
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

    SecureStore.deleteItemAsync("access_token");
    SecureStore.deleteItemAsync("refresh_token");
    SecureStore.deleteItemAsync("secret_token");

    console.log("Storage cleared");
  };

  const accountTitle = "Account Management Screens";

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
    navigation.navigate("OverviewStack", { screen: "MealPlan" });
  };

  const moduleTitle = "Weitere Module";

  const onPressModuleFunctions = [
    handleDashboardPress,
    handleDualisPress,
    handleMealPlanPress,
  ];

  const moduleTexts = ["Dashboard", "Dualis", "Meal Plan"];

  const moduleIconNames = ["dashboard", "school", "restaurant"];

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
    navigation.navigate("MiscStack", { screen: "Credits" });
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

  const overviewTitle = "Alle Seiten";

  const onPressOverviewFunctions = [
    handleSettingsPress,
    handleDisclosurePress,
    handleCreditsPress,
    handleGitLabPress,
    handleGitHubPress,
    handleMasterCollectionPress,
    handleImprintPress,
  ];

  const overviewTexts = [
    "Settings",
    "Responsible Disclosure",
    "Credits",
    "GitLab",
    "GitHub",
    "TheMasterCollection",
    "Imprint",
  ];

  //! Icons for GitLab, GitHub and TheMasterCollection need change
  const moduleIcons = [
    "settings",
    "bug-report",
    "lightbulb",
    "lightbulb",
    "lightbulb",
    "lightbulb",
    "article",
  ];

  const moduleIsExternalLink = [false, false, false, true, true, true, false];

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <ProfileView />
      {/* <Navigator
        title={moduleTitle}
        onPressFunctions={onPressModuleFunctions}
        texts={moduleTexts}
        iconNames={moduleIconNames}
      /> */}
      <Navigator
        title={accountTitle}
        onPressFunctions={onPressAccountFunctions}
        texts={accountTexts}
        iconNames={accountIconNames}
      />
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
