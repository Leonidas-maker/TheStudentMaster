// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView, Linking } from "react-native";
import { useTranslation } from "react-i18next";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../../../components/textFields/DefaultText";
import Heading from "../../../../components/textFields/Heading";
import DefaultButton from "../../../../components/buttons/DefaultButton";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const BugReport: React.FC = () => {
  const { t } = useTranslation("overview");
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
          <Heading text={t("bug_report_header")} />
        </View>
        <View className="flex-1 m-5">
          <View className="mb-3">
            <DefaultText text={t("bug_report_text")} />
          </View>
          <DefaultText text={t("bug_report_open_source")} />
        </View>
        <View className="content-center items-center">
          <DefaultButton
            text={t("bug_report_repo")}
            onPress={handleGitLabPress}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default BugReport;
