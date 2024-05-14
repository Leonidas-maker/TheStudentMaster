import React from "react";
import { View, ScrollView, Keyboard, Pressable, Alert } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import TextButton from "../../../components/buttons/TextButton";
import DefaultText from "../../../components/textFields/DefaultText";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from '@react-navigation/native';

const storeTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await SecureStore.setItemAsync('access_token', accessToken);
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  } catch (e) {
    console.error('Error saving tokens: ', e);
  }
};

const getTokens = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    return { accessToken, refreshToken };
  } catch (e) {
    console.error('Error getting tokens: ', e);
    return { accessToken: null, refreshToken: null };
  }
};

const logTokens = async () => {
  try {
    const { accessToken, refreshToken } = await getTokens();
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
  } catch (e) {
    console.error('Error logging tokens: ', e);
  }
};

const Login: React.FC = () => {
  const [ident, setIdent] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigation = useNavigation<any>();

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
          ident: ident,
          password: password,
        },
      );

      if (response.data.secret_token) {
        await SecureStore.setItemAsync('secret_token', response.data.secret_token);
        navigation.navigate('VerifyLogin');
      } else if (response.data.access_token && response.data.refresh_token) {
        await storeTokens(response.data.access_token, response.data.refresh_token);
        Alert.alert(
          "Login erfolgreich",
          "Sie sind jetzt eingeloggt",
        );
        await logTokens();
        navigation.navigate('HomeBottomTabs');
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
            value={ident}
            onChangeText={setIdent}
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
