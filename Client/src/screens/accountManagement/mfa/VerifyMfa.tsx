import React from "react";
import { View, ScrollView } from "react-native";
import DefaultText from "../../../components/textFields/DefaultText";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";
import DefaultButton from "../../../components/buttons/DefaultButton";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";

const VerifyMfa: React.FC = () => {
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="justify-center items-center p-3">
        <Heading text="Bitte bestätige dein MFA" />
        <Subheading text="Gib den Code deiner Authentication App ein" />
      </View>
      <OTPInput onOtpChange={() => console.log("Change")} />
      <View className="justify-center items-center">
        <DefaultButton text="Verifizieren" />
      </View>
    </ScrollView>
  );
};

export default VerifyMfa;
