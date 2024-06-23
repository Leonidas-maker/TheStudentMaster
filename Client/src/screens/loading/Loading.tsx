// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Loading: React.FC = (props: any) => {

  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const { navigation } = props;

  // ====================================================== //
  // ===================== Functions ====================== //
  // ====================================================== //
  // Navigates to the given route and resets the navigation stack
  const navigateAndReset = (routeName: string) => {
    navigation.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  };

  // Checks if the user has already completed the onboarding process
  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem("onboarding");
      if (onboardingStatus === "true") {
        navigateAndReset("HomeBottomTabs");
      } else {
        navigateAndReset("Onboarding");
      }
    } catch (error) {
      console.error(
        "Error reading onboarding status from AsyncStorage:",
        error,
      );
      navigateAndReset("Onboarding");
    }
  };

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Check the onboarding status when the component mounts
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex h-screen items-center justify-center bg-light_primary dark:bg-dark_primary">
      <ActivityIndicator size="large" />
      <DefaultText text="Loading..." />
    </View>
  );
};

export default Loading;
