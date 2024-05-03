import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";

import OTPInput from "../../../components/accountManagement/otpInput/OTPInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import Subheading from "../../../components/textFields/Subheading";

const VerifyRegistration: React.FC = () => {

    const { t } = useTranslation();

    // TODO Implement paste functionality
    // TODO I have to create own components for this stuff
    return (
        <ScrollView className='h-screen bg-primary'>
            <View className="justify-center items-center p-3">
                <Heading text="Bitte bestätige deine Registrierung" />
                <Subheading text="Wir haben dir einen Code per Mail gesendet." />
            </View>
            <OTPInput />
            <View className="justify-center items-center">
                <DefaultButton text="Registrieren" />
            </View>
        </ScrollView>
    );
}


export default VerifyRegistration;