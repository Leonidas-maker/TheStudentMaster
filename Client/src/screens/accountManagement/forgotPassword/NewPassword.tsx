// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView, Keyboard, Pressable } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const NewPassword: React.FC = () => {
  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <Pressable onPress={dismissKeyboard}>
      <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
        <View className="p-3 justify-center items-center">
          <Heading text="Gib dein neues Passwort ein" />
          <TextFieldInput
            autoCapitalize="none"
            autoFocus={true}
            enterKeyHint="next"
            placeholder="Neues Passwort"
            autoComplete="new-password"
            secureTextEntry={true}
          />
          <TextFieldInput
            autoCapitalize="none"
            enterKeyHint="done"
            placeholder="Neues Passwort wiederholen"
            autoComplete="new-password"
            secureTextEntry={true}
          />
          <DefaultButton text="Passwort zurücksetzen" />
        </View>
      </ScrollView>
    </Pressable>
  );
};

export default NewPassword;
