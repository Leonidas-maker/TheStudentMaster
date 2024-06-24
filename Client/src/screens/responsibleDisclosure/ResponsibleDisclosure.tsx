// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView, Linking } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import Heading from "../../components/textFields/Heading";
import TextButton from "../../components/buttons/TextButton";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const ResponsibleDisclosure: React.FC = () => {
  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  const handleMailPress = () => {
    Linking.openURL("mailto:responsible_disclosure@thestudentmaster.de");
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="px-5 py-5">
        <View className="mb-5">
          <Heading text="Du hast eine Sicherheitslücke in unserer App oder unserem Server gefunden?" />
        </View>
        <View className="flex-1 m-5">
          <View className="mb-3">
            <DefaultText text="Schreib uns bitte eine E-Mail an die unten stehende Adresse mit allen relevanten Informationen und wir werden so schnell wie möglich mit dir in Kontakt treten." />
          </View>
          <TextButton text="responsible_disclosure@thestudentmaster.de" onPress={handleMailPress} />
        </View>
      </View>
    </ScrollView>
  );
};

export default ResponsibleDisclosure;
