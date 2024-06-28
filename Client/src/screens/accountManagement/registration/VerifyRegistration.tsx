// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const VerifyRegistration: React.FC = () => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="justify-center items-center p-3">
        <Heading text="Bitte bestätige deine Registrierung" />
        <Subheading text="Wir haben dir einen Code per Mail gesendet." />
      </View>
      <OTPInput onOtpChange={() => console.log("Change")} />
      <View className="justify-center items-center">
        <DefaultButton text="Registrieren" />
      </View>
    </ScrollView>
  );
};

export default VerifyRegistration;
