import React from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, Keyboard, Pressable } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";
import Heading from "../../../components/textFields/Heading";
import TextButton from "../../../components/buttons/TextButton";
import DefaultText from "../../../components/textFields/DefaultText";

const Login: React.FC = () => {
    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleForgotPress = () => {
        console.log("Forgot password pressed");
    }

    return (
        <Pressable onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="pt-10 justify-center items-center">
                    <Heading text="Willkommen" />
                    <TextFieldInput autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Nutzername / Email" />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="done" placeholder="Passwort" secureTextEntry={true} />
                    <View className="w-3/4 justify-end items-end my-4">
                        <TextButton text="Passwort vergessen?" onPress={handleForgotPress} />
                    </View>
                    <DefaultButton text="Anmelden" />
                </View>
                <View className="h-full justify-center items-center">
                    <View className="flex-row w-3/4 justify-center items-center">
                        <View className="pr-1">
                            <DefaultText text="Noch kein Konto?" />
                        </View>
                        <TextButton text="Hier registrieren" onPress={handleForgotPress} />
                    </View>
                </View>
            </ScrollView>
        </Pressable>
    );
}
export default Login;
