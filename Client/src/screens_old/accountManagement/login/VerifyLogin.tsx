// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
//! Not able to get repsonse from server
const VerifyLogin: React.FC = () => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [otpCode, setOtpCode] = useState("");

  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  // ====================================================== //
  // ====================== Functions ===================== //
  // ====================================================== //
  const handleOtpChange = (code: string) => {
    setOtpCode(code);
  };

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  const handleVerifyPress = async () => {
    // Verify the 2FA code
    try {
      const secretToken = await SecureStore.getItemAsync("secret_token");

      // Check if secret token is available
      if (!secretToken) {
        throw new Error("Secret token not found");
      }

      // Send the 2FA code to the backend
      const response = await axios.post(
        "/auth/verify-2fa",
        {
          otp_code: otpCode,
        },
        {
          headers: {
            Authorization: `Bearer ${secretToken}`,
          },
        },
      );

      // Check if the response contains the access and refresh token
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

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
