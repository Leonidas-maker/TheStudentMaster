// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView, Linking } from "react-native";
import { useTranslation } from "react-i18next";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../../../components/textFields/DefaultText";
import Heading from "../../../../components/textFields/Heading";
import TextButton from "../../../../components/buttons/TextButton";
import Subheading from "../../../../components/textFields/Subheading";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Imprint: React.FC = () => {
  const { t } = useTranslation("overview");
  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  const handleMailPress = () => {
    Linking.openURL("mailto:contact@thestudentmaster.de");
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="px-5 py-5">
        <View className="mb-5">
          <Heading text={t("imprint_heading")} />
          <Subheading text={t("imprint_subheading")} />
        </View>
        <View className="flex-1 mx-5">
          <View className="mb-5">
            <DefaultText text={t("under_development")} />
          </View>
          <View className="mb-3">
            <DefaultText text="Andreas Schütz," />
          </View>
          <View className="mb-3">
            <DefaultText text="Leon Sylvester" />
          </View>
          <View className="mb-3 flex-row">
            <DefaultText text={t("email_text")} />
            <TextButton
              text="contact@thestudentmaster.de"
              onPress={handleMailPress}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Imprint;
