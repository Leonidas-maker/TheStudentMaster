import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

const VerifyRegistration: React.FC = () => {

    const { t } = useTranslation();

    // TODO Implement paste functionality
    // TODO I have to create own components for this stuff
    return (
        <ScrollView className='h-screen bg-primary'>
            <View className="justify-center items-center p-3">
                <Text className="text-font_primary text-4xl font-bold text-center">Bitte bestätige deine Registrierung</Text>
                <Text className="text-font_primary text-xl pt-3">Wir haben dir einen Code per Mail gesendet.</Text>
            </View>
            <OTPInput />
            <View className="justify-center items-center">
                <DefaultButton text="Registrieren" />
            </View>
        </ScrollView>
    );
}


export default VerifyRegistration;