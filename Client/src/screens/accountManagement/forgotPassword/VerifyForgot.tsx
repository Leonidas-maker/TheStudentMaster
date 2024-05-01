import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TextInput, Keyboard, TouchableOpacity, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";

const VerifyForgot: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };



    return (
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Verifiziere dich um dein Passwort zurückzusetzen</Text>
                    <OTPInput />
                    <TouchableOpacity className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center mt-10">
                        <Text className="text-black">Verifizieren</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </TouchableOpacity>
    );
}

export default VerifyForgot;