import React from "react";
import { View, ScrollView } from "react-native";
import DefaultText from "../../components/textFields/DefaultText";

const ResponsibleDisclosure: React.FC = () => {
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View>
        <DefaultText text="Welcome to the Responsible Disclosure page" />
      </View>
    </ScrollView>
  );
};

export default ResponsibleDisclosure;
