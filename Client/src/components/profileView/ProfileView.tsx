import React, { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

function ProfileView() {
  const navigation = useNavigation<any>();

  const handleProfilePress = () => {
    navigation.navigate("OverviewStack", { screen: "Profile" });
  };

  const { t } = useTranslation();

  return (
    <View className="m-4">
      <Text className="text-font_primary text-xl font-bold mb-2">Profil</Text>
      <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
        <TouchableOpacity onPress={handleProfilePress}>
          <View className="flex-row justify-between items-center">
            <Icon name="person" size={40} color="#E0E0E2" />
            <View className="ml-2">
              <Text className="text-font_primary font-bold text-2xl">
                Account Name
              </Text>
              <Text className="text-font_primary font-bold text-md">
                @AccountName
              </Text>
            </View>
            <Icon
              name="arrow-forward-ios"
              size={30}
              color="#E0E0E2"
              style={{ marginLeft: "auto" }}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ProfileView;
