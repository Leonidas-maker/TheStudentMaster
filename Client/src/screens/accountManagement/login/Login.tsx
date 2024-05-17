import React, { useEffect } from "react";
import { View, ScrollView, Keyboard, Pressable, Alert } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import TextButton from "../../../components/buttons/TextButton";
import { useNavigation } from "@react-navigation/native";
import OptionSwitch from "../../../components/switch/OptionSwitch";
import DefaultText from "../../../components/textFields/DefaultText";
import {
  clearTokens,
  isLoggedIn,
  setTokens,
} from "../../../services/authService";
import { axiosInstance } from "../../../services/api";

const Login: React.FC = () => {
  const [ident, setIdent] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigation = useNavigation<any>();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        navigation.navigate("HomeBottomTabs");
      }
    };
    checkLoginStatus();
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const toggleStayLoggedIn = () => {
    console.log("Stay logged in toggled");
  };

  const handleForgotPress = () => {
    console.log("Forgot password pressed");
  };

  const login = async (ident: string, password: string) => {
    clearTokens();
    try {
      const response = await axiosInstance.post("/auth/login", {
        ident,
        password,
      });
      setTokens({
        access: response.data.access_token,
        refresh: response.data.refresh_token,
        secret: response.data.secret_token,
      });
      return response.data;
    } catch (error) {
      console.error("Login error: ", error);
      throw error;
    }
  };

  const handleLoginPress = async () => {
    try {
      const response = await login(ident, password);
      if (response.secret_token) {
        navigation.navigate("VerifyLogin");
      } else {
        Alert.alert("Login erfolgreich", "Sie sind jetzt eingeloggt");
        navigation.navigate("HomeBottomTabs");
      }
    } catch (error) {
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
        </View>
        <View className="p-2">
          <OptionSwitch
            title="Login Optionen"
            texts={["Angemeldet bleiben?"]}
            iconNames={["update"]}
            onValueChanges={[toggleStayLoggedIn]}
            values={[true]}
          />
        </View>
        <View className="pt-2 justify-center items-center">
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
