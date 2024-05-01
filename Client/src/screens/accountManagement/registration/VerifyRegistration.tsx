import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";

import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";

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
                <TouchableOpacity className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center mt-10">
                    <Text className="text-black">Registrieren</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}


export default VerifyRegistration;