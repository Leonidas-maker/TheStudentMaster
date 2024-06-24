// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView, Linking } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";
import Heading from "../../components/textFields/Heading";
import DefaultButton from "../../components/buttons/DefaultButton";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const BugReport: React.FC = () => {
  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  const handleGitLabPress = () => {
    Linking.openURL("https://gitlab.com/themastercollection/thestudentmaster");
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="px-5 py-5">
        <View className="mb-5">
          <Heading text="Du hast einen Fehler gefunden?" />
        </View>
        <View className="flex-1 m-5">
          <View className="mb-3">
            <DefaultText text="Erstelle ein Issue auf GitLab damit wir diesen beheben können." />
          </View>
          <DefaultText text="Gerne kannst du auch selber versuchen den Fehler zu beheben, da diese App ein Open Source Projekt ist!" />
        </View>
        <View className="content-center items-center">
          <DefaultButton text="Zum GitLab Repository" onPress={handleGitLabPress} />
        </View>
      </View>
    </ScrollView>
  );
};

export default BugReport;
