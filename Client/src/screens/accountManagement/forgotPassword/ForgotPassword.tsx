import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, Keyboard, Pressable } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Pressable onPress={dismissKeyboard}>
      <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
        <View className="p-3 justify-center items-center">
          <Heading text="Du hast dein Passwort vergessen?" />
          <Subheading text="Setze dein Passwort hier zurück indem du deine EMail Adresse eingibst." />
          <TextFieldInput
            autoCapitalize="none"
            autoFocus={true}
            enterKeyHint="done"
            placeholder="Email"
            autoComplete="email"
          />
          <DefaultButton text="Passwort zurücksetzen" />
        </View>
      </ScrollView>
    </Pressable>
  );
};

export default ForgotPassword;
