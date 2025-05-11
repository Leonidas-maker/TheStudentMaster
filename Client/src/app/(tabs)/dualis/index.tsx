import React, { useState, useEffect } from "react";
import {
  Pressable,
  View,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

// ~~~~~~~~~~~~~~~ Own components imports ~~~~~~~~~~~~~~~ //
import OptionSwitch from "../../../components/switch/OptionSwitch";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import Heading from "../../../components/textFields/Heading";
import DefaultButton from "../../../components/buttons/DefaultButton";
import DefaultText from "../../../components/textFields/DefaultText";
import {
  asyncSaveData,
  asyncLoadData,
  asyncRemoveData,
} from "../../../components/storageManager/asyncStorageManager";
import {
  secureSaveData,
  secureLoadData,
  secureRemoveData,
} from "../../../components/storageManager/secureStorageManager";
import Toast from "react-native-toast-message";
import DefaultToast from "../../../components/defaultToast/DefaultToast";

import { loginDualis } from "../../../services/dualis/loginService";

const DualisLogin: React.FC = () => {
  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const router = useRouter();
  const navigation = useNavigation();

  const { t } = useTranslation("dualis");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saveLogin, setSaveLogin] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authArguments, setAuthArguments] = useState<string>("");

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Set the icon color based on the color scheme
  const iconColor = colorScheme !== "light" ? "#FFFFFF" : "#000000";

  // Dynamically enable/disable the login button
  const disableButton = !username.trim() || !password.trim() || loading;

  // Function to handle login
  const login = async () => {
    setError("");
    setLoading(true);
    // await boolean success flag
    const success = await loginDualis(
      username,
      password,
      saveCredentials,
      setError,
      setAuthArguments,
      saveLogin,
    );

    if (success) {
      router.replace("/(tabs)/dualis/(dualisViews)/DualisLoad");
    } else {
      Toast.show({
        type: "error",
        text1: t("login_error_title"),
        text2: t("login_error_msg")
      });
    }
    // else: error state was set by the service, stay on this screen
    setLoading(false);
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
    Alert.alert(t("info_title"), t("info_message"), [{ text: "OK" }]);
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
      <View className="h-screen bg-light_primary dark:bg-dark_primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <DefaultText text={t("loading_credentials")} />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="h-screen bg-light_primary dark:bg-dark_primary flex-1 justify-center">
        <DefaultToast />
        <View>
          <Heading text={t("dualis_login_header")} />
          <View className="items-center">
            <TextFieldInput
              placeholder={t("username")}
              value={username}
              onChangeText={(text) => {
                setError("");
                setUsername(text);
              }}
              autoCapitalize="none"
            />
            <TextFieldInput
              placeholder={t("password")}
              value={password}
              onChangeText={(text) => {
                setError("");
                setPassword(text);
              }}
              secureTextEntry
            />
            <OptionSwitch
              title={t("login_options_title")}
              texts={[t("save_login_credentials")]}
              iconNames={["update"]}
              onValueChanges={[toggleSaveLogin]}
              values={[saveLogin]}
            />
            {/* {error ? (
              <View className="px-4">
                <Text className="text-red-500 mt-2 text-center">
                  {t("login_error_msg")}
                </Text>
              </View>
            ) : null} */}
            <DefaultButton
              text={t("login_btn")}
              onPress={login}
              disabled={disableButton}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DualisLogin;
