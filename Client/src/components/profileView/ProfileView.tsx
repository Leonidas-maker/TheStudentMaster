// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { Text, View, Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import { fetchUser } from "../../services/userService";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { UserProps } from "../../interfaces/userInterfaces";

// Placeholder for Login component
const Login: React.FC = () => {
  return (
    <View className="m-4">
      <Text className="text-black dark:text-white text-xl font-bold mb-2">
        Please login to access your profile.
      </Text>
    </View>
  );
};

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const ProfileView: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [username, setUsername] = useState("");
  const [userUuid, setUserUuid] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [isLight, setIsLight] = useState(false);

  // ~~~~~~~~~~~ Use navigation ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Check if the color scheme is light or dark
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // Set the icon color based on the color scheme
  const iconColor = isLight ? "#000000" : "#FFFFFF";

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        //TODO Fetch this data at the start of the app and use the stored data @leonidas-maker
        await fetchUser(setUser);

        if (!user.user_uuid || !user.username) {
          setIsLoggedIn(false);
          return;
        }

        setUsername(user.username);
        setUserUuid(user.user_uuid);

        await SecureStore.setItemAsync("username", username);
        await SecureStore.setItemAsync("uuid", userUuid);
        setIsLoggedIn(true);
      } catch (error) {
        console.log(error);
        setIsLoggedIn(false);
      }
    };

    fetchData();
  }, []);

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  // Navigate to the profile screen
  const handleProfilePress = () => {
    navigation.navigate("CredentialStack", { screen: "Profile" });
  };

  // Navigate to the login screen
  const handleLoginPress = () => {
    navigation.navigate("CredentialStack", { screen: "Login" });
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="m-4">
      <Text className="text-black dark:text-white text-xl font-bold mb-2">
        Profil
      </Text>
      <View className="bg-light_secondary dark:bg-dark_secondary rounded-lg shadow-md p-4">
        {isLoggedIn ? (
          <Pressable onPress={handleProfilePress} className="active:opacity-50">
            <View className="flex-row justify-between items-center">
              <Icon name="person" size={40} color={iconColor} />
              <View className="ml-2">
                <Text className="text-black dark:text-white font-bold text-2xl">
                  {username}
                </Text>
                <Text className="text-black dark:text-white font-bold text-xs">
                  @{userUuid}
                </Text>
              </View>
              <Icon
                name="arrow-forward-ios"
                size={30}
                color={iconColor}
                style={{ marginLeft: "auto" }}
              />
            </View>
          </Pressable>
        ) : (
          <Pressable onPress={handleLoginPress} className="active:opacity-50">
            <View className="flex-row justify-between items-center">
              <Icon name="person" size={40} color={iconColor} />
              <View className="ml-2">
                <Text className="text-black dark:text-white font-bold text-3xl">
                  Anmelden
                </Text>
              </View>
              <Icon
                name="arrow-forward-ios"
                size={30}
                color={iconColor}
                style={{ marginLeft: "auto" }}
              />
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ProfileView;
