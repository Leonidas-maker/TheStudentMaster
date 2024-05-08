import React, { useState, useEffect } from "react";
import { Text, View, Pressable, useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const ProfileView: React.FC = () => {
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

  const iconColor = isLight ? "#000000" : "#FFFFFF";

  const handleProfilePress = () => {
    navigation.navigate("OverviewStack", { screen: "Profile" });
  };

  const { t } = useTranslation();

  return (
    <View className="m-4">
      <Text className="text-black dark:text-white text-xl font-bold mb-2">
        Profil
      </Text>
      <View className="bg-light_secondary dark:bg-dark_secondary rounded-lg shadow-md p-4">
        <Pressable onPress={handleProfilePress} className="active:opacity-50">
          <View className="flex-row justify-between items-center">
            <Icon name="person" size={40} color={iconColor} />
            <View className="ml-2">
              <Text className="text-black dark:text-white font-bold text-2xl">
                Account Name
              </Text>
              <Text className="text-black dark:text-white font-bold text-md">
                @AccountName
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
      </View>
    </View>
  );
};

export default ProfileView;
