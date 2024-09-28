// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect } from "react";
import { View, ScrollView, Keyboard, Pressable, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import TextButton from "../../../components/buttons/TextButton";
import OptionSwitch from "../../../components/switch/OptionSwitch";
import DefaultText from "../../../components/textFields/DefaultText";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import {
  clearTokens,
  isLoggedIn,
  setTokens,
} from "../../../services/authService";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Login: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [ident, setIdent] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [stayLoggedIn, setStayLoggedIn] = React.useState(true);

  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Checks if the user is already logged in and redirects to the home screen
  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        navigation.navigate("HomeBottomTabs");
      }
    };
    checkLoginStatus();
  }, []);

  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Toggles the stay logged in switch
  const toggleStayLoggedIn = () => {
    console.log("Stay logged in toggled");
    setStayLoggedIn(!stayLoggedIn);
  };

  // Login function that sends the login request to the backend
  const login = async (ident: string, password: string) => {
    clearTokens();
    try {
      const response = await axios.post("/auth/login", {
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

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  // Handles the login button press and checks if the login was successful, if secret_token is returned
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

  // Handles the forgot password button press
  const handleForgotPress = () => {
    console.log("Forgot password pressed");
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
            values={[stayLoggedIn]}
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
