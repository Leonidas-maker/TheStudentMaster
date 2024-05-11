import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

const VerifyLogin: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ScrollView className="h-screen bg-primary">
      <View className="justify-center items-center p-3">
        <Heading text="Bitte bestätige deine Anmeldung" />
        <Subheading text="Gib den Code deiner Authentication App ein" />
      </View>
      <OTPInput />
      <View className="justify-center items-center">
        <DefaultButton text="Bestätigen" />
      </View>
    </ScrollView>
  );
};

export default VerifyLogin;