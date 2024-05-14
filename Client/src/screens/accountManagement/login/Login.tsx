import React from "react";
import { View, ScrollView, Keyboard, Pressable, Alert } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import TextButton from "../../../components/buttons/TextButton";
import DefaultText from "../../../components/textFields/DefaultText";
import axios from "axios";

//! Still work in progress
const Login: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleForgotPress = () => {
    console.log("Forgot password pressed");
  };

  const handleLoginPress = async () => {
    try {
      const response = await axios.post(
        "https://thestudentmaster.de/auth/login",
        {
          username,
          password,
        },
      );

      if (response.data.access_token) {
        Alert.alert(
          "Login erfolgreich",
          "Access Token: " + response.data.access_token,
        );
      }
    } catch (error) {
      console.error("Login error: ", error);
      Alert.alert(
        "Login fehlgeschlagen",
        "Überprüfen Sie Ihre Anmeldeinformationen.",
      );
    }
  };

  return (
    <Pressable onPress={dismissKeyboard}>
      <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
        <View className="pt-10 justify-center items-center">
          <Heading text="Willkommen" />
          <TextFieldInput
            autoCapitalize="none"
            autoFocus={true}
            enterKeyHint="next"
            placeholder="Nutzername / Email"
            value={username}
            onChangeText={setUsername}
          />
          <TextFieldInput
            autoCapitalize="none"
            enterKeyHint="done"
            placeholder="Passwort"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <View className="w-3/4 justify-end items-end my-4">
            <TextButton
              text="Passwort vergessen?"
              onPress={handleForgotPress}
            />
          </View>
          <DefaultButton text="Anmelden" onPress={handleLoginPress} />
        </View>
        <View className="h-full justify-center items-center">
          <View className="flex-row w-3/4 justify-center items-center">
            <View className="pr-1">
              <DefaultText text="Noch kein Konto?" />
            </View>
            <TextButton text="Hier registrieren" onPress={handleForgotPress} />
          </View>
        </View>
      </ScrollView>
    </Pressable>
  );
};
export default Login;
