import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import DefaultText from "../../components/textFields/DefaultText";

const ResponsibleDisclosure: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View>
        <DefaultText text="Welcome to the Responsible Disclosure page" />
      </View>
    </ScrollView>
  );
};

export default ResponsibleDisclosure;
