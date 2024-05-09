import React from "react";
import { View, ScrollView, Keyboard, Pressable } from "react-native";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";

const VerifyForgot: React.FC = () => {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Pressable onPress={dismissKeyboard}>
      <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
        <View className="p-3 justify-center items-center">
          <Heading text="Verifiziere dich um dein Passwort zurückzusetzen" />
          <OTPInput />
          <DefaultButton text="Verifizieren" />
        </View>
      </ScrollView>
    </Pressable>
  );
};

export default VerifyForgot;
