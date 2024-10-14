import React, { useState, useEffect } from "react";
import {
  Pressable,
  View,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import OptionSwitch from "../../components/switch/OptionSwitch";
import TextFieldInput from "../../components/textInputs/TextFieldInput";
import Heading from "../../components/textFields/Heading";
import DefaultButton from "../../components/buttons/DefaultButton";
import DefaultText from "../../components/textFields/DefaultText";
import {
  asyncSaveData,
  asyncLoadData,
  asyncRemoveData,
} from "../../components/storageManager/asyncStorageManager";
import {
  secureSaveData,
  secureLoadData,
  secureRemoveData,
} from "../../components/storageManager/secureStorageManager";

import { loginDualis } from "../../services/dualis/loginService";

const DualisLogin: React.FC = () => {
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saveLogin, setSaveLogin] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authArguments, setAuthArguments] = useState<string>("");
  const [isLight, setIsLight] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Set the icon color based on the color scheme
  const iconColor = isLight ? "#FFFFFF" : "#000000";

  // Function to handle login
  const login = async () => {
    setDisableButton(true);
    setLoading(true);
    setProgress(0);

    await loginDualis(
      username,
      password,
      saveCredentials,
      setError,
      setAuthArguments,
      saveLogin,
    );

    navigation.reset({
      index: 0,
      routes: [{ name: "Dualis", params: { screen: "DualisLoad" } }],
    });
  };

  // useEffect(() => {
  //     const navigateToLoad = () => {
  //         console.log("authArguments", authArguments);
  //         if (authArguments) {
  //             navigation.navigate("DualisLoad");
  //         }
  //     };

  //     navigateToLoad();
  // }, []);

  // Set the header button dynamically
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleInfoPress}>
          <Icon
            name="info"
            size={30}
            color={iconColor}
            style={{ marginLeft: "auto", marginRight: 15 }}
          />
        </Pressable>
      ),
    });
  }, [navigation, colorScheme]);

  const handleInfoPress = () => {
    Alert.alert(
      "Dualis Informationen",
      "Deine Dualis Anmeldedaten werden ausschließlich lokal auf deinem Gerät gespeichert. Die Daten werden nur für den Login bei Dualis verwendet und deine Noten werden nur von deinem Gerät lokal verarbeitet. Nach dem Logout werden alle Noten von deinem Gerät gelöscht. Weder deine Anmeldedaten noch deine Noten werden an unseren Server übertragen.",
      [{ text: "OK" }],
    );
  };

  // Function to save login credentials
  const saveCredentials = () => {
    asyncSaveData("dualisUsername", username);
    secureSaveData("dualisPassword", password);
  };

  // Function to remove login credentials
  const removeCredentials = async () => {
    asyncRemoveData("dualisUsername");
    secureRemoveData("dualisPassword");
  };

  // Load saveLogin state from AsyncStorage when component mounts
  useEffect(() => {
    const loadSavedLogin = async () => {
      const savedSaveLogin = await asyncLoadData("saveDualisLogin");

      if (savedSaveLogin !== null) {
        setSaveLogin(JSON.parse(savedSaveLogin)); // Convert string back to boolean
      }
    };

    loadSavedLogin();
  }, []);

  // Save saveLogin state to AsyncStorage when it changes
  useEffect(() => {
    asyncSaveData("saveDualisLogin", JSON.stringify(saveLogin));
  }, [saveLogin]);

  // Toggles the save login switch
  const toggleSaveLogin = () => {
    setSaveLogin(!saveLogin);

    // Remove credentials if saveLogin is disabled
    if (!saveLogin === false) {
      removeCredentials();
    }
  };

  // Load saved credentials when component mounts
  useEffect(() => {
    const loadCredentials = async () => {
      const savedUsername = await asyncLoadData("dualisUsername");
      const savedPassword = await secureLoadData("dualisPassword");

      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);

      setIsLoginLoading(false);
    };

    if (saveLogin) {
      loadCredentials();
    } else {
      setIsLoginLoading(false);
    }
  }, [saveLogin]);

  // Wait for login data to load (this is very fast so it will most likely not be shown)
  if (isLoginLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <DefaultText text="Lade Anmeldedaten..." />
      </View>
    );
  }

  return (
    <View className="h-screen bg-light_primary dark:bg-dark_primary flex-1 justify-center">
      <View>
        <Heading text="Bei Dualis anmelden" />
        <View className="items-center">
          <TextFieldInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextFieldInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <OptionSwitch
            title="Login Optionen"
            texts={["Anmeldedaten speichern"]}
            iconNames={["update"]}
            onValueChanges={[toggleSaveLogin]}
            values={[saveLogin]}
          />
          <DefaultButton text="Login" onPress={login} disabled={disableButton} />
        </View>
        {error ? <DefaultText text={error} /> : null}
      </View>
    </View>
  );
};

export default DualisLogin;
