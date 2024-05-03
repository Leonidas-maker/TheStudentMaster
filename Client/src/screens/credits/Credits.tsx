import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import DefaultText from "../../components/textFields/DefaultText";

const Credits: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView className="h-screen bg-primary">
      <View>
        <DefaultText text="Welcome to the Credits page" />
      </View>
    </ScrollView>
  );
};

export default Credits;
