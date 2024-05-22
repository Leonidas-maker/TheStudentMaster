import React, { useState, useEffect } from "react";
import { Text, View, Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { fetchUser } from "../../services/userService";

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

interface User {
  username: string | "";
  email: string | "";
  uuid: string | "";
  avatar: string | "";
  address:
    | {
        address1: string;
        address2: string;
        district: string;
        postal_code: string;
        city: string;
        country: string;
      }
    | "";
}

const ProfileView: React.FC = () => {
  const [username, setUsername] = useState("");
  const [userUuid, setUserUuid] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation<any>();

  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await SecureStore.getItemAsync("access_token");
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        const [user, setUser] = useState<User>({} as User);

        if (!token || !refreshToken) {
          setIsLoggedIn(false);
          return;
        }

        await fetchUser(setUser);

        //TODO Use the service

        setUsername(user?.username);
        setUserUuid(user?.uuid);

        await SecureStore.setItemAsync("username", username);
        await SecureStore.setItemAsync("uuid", userUuid);

        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error fetching user data: ", error);
        setIsLoggedIn(false);
      }
    };

    fetchData();
  }, []);

  const iconColor = isLight ? "#000000" : "#FFFFFF";

  const handleProfilePress = () => {
    navigation.navigate("OverviewStack", { screen: "Profile" });
  };

  const handleLoginPress = () => {
    navigation.navigate("OverviewStack", { screen: "Login" });
  };

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
