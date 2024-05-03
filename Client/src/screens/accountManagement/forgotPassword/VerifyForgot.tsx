import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, Keyboard, Pressable } from "react-native";
import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";

const VerifyForgot: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };



    return (
        <Pressable onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Heading text="Verifiziere dich um dein Passwort zurückzusetzen" />
                    <OTPInput />
                    <DefaultButton text="Verifizieren" />
                </View>
            </ScrollView>
        </Pressable>
    );
}

export default VerifyForgot;