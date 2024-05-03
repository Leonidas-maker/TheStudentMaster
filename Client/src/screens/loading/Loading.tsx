import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, ActivityIndicator } from "react-native";
import DefaultText from "../../components/textFields/DefaultText";

const Loading: React.FC = (props: any) => {
  const { navigation } = props;

  const { t } = useTranslation();

  const navigateAndReset = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "HomeBottomTabs" }],
    });
  };

  //! This is a temporary solution while we do not have any checks for the user being logged in or not
  useEffect(() => {
    setTimeout(() => {
      navigateAndReset();
    }, 1000);
  }, []);

  return (
    <View className="flex h-screen items-center justify-center bg-primary">
      <ActivityIndicator size="large" />
      <DefaultText text="Loading..." />
    </View>
  );
};

export default Loading;
