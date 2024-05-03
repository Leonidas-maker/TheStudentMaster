import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Keyboard, Pressable } from "react-native";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

const VerifyForgot: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };



    return (
        <Pressable onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Verifiziere dich um dein Passwort zurückzusetzen</Text>
                    <OTPInput />
                    <DefaultButton text="Verifizieren" />
                </View>
            </ScrollView>
        </Pressable>
    );
}

export default VerifyForgot;