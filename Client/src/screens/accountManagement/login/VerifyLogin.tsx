import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

//! Not able to get repsonse from server
const VerifyLogin: React.FC = () => {
  const [otpCode, setOtpCode] = useState("");
  const navigation = useNavigation<any>();

  const handleOtpChange = (code: string) => {
    setOtpCode(code);
  };

  const handleVerifyPress = async () => {
    try {
      const secretToken = await SecureStore.getItemAsync("secret_token");

      console.log("Secret Token:", secretToken);

      if (!secretToken) {
        throw new Error("Secret token not found");
      }

      const response = await axios.post(
        "https://thestudentmaster.de/auth/verify-2fa",
        {
          otp_code: otpCode,
        },
        {
          headers: {
            Authorization: `Bearer ${secretToken}`,
          },
        },
      );

      if (response.data.access_token && response.data.refresh_token) {
        await SecureStore.setItemAsync(
          "access_token",
          response.data.access_token,
        );
        await SecureStore.setItemAsync(
          "refresh_token",
          response.data.refresh_token,
        );
        Alert.alert("2FA erfolgreich", "Sie sind jetzt eingeloggt");
        navigation.navigate("HomeBottomTabs");
      }
    } catch (error) {
      console.error("2FA error: ", error);
      Alert.alert("2FA fehlgeschlagen", "Überprüfen Sie Ihren Code.");
    }
  };

  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View className="justify-center items-center p-3">
        <Heading text="Bitte bestätige deine Anmeldung" />
        <Subheading text="Gib den Code deiner Authentication App ein" />
      </View>
      <OTPInput onOtpChange={handleOtpChange} />
      <View className="justify-center items-center">
        <DefaultButton text="Bestätigen" onPress={handleVerifyPress} />
      </View>
    </ScrollView>
  );
};

export default VerifyLogin;
