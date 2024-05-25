import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DefaultText from "../../components/textFields/DefaultText";

const Loading: React.FC = (props: any) => {
  const { navigation } = props;

  const navigateAndReset = (routeName: string) => {
    navigation.reset({
      index: 0,
      routes: [{ name: routeName }],
    });
  };

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

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  return (
    <View className="flex h-screen items-center justify-center bg-light_primary dark:bg-dark_primary">
      <ActivityIndicator size="large" />
      <DefaultText text="Loading..." />
    </View>
  );
};

export default Loading;
