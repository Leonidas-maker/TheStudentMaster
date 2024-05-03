import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Keyboard, Pressable } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

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
                    <Text className="text-font_primary text-4xl pb-5">Willkommen</Text>
                    <TextFieldInput autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Nutzername / Email" />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="done" placeholder="Passwort" secureTextEntry={true} />
                    <View className="w-3/4 justify-end items-end mt-4">
                        <Text className="text-white text-xs underline" onPress={handleForgotPress}>Passwort vergessen?</Text>
                    </View>
                    <DefaultButton text="Anmelden" />
                </View>
                <View className="h-full justify-center items-center">
                    <View className="w-3/4 justify-center items-center">
                        <Text className="text-white text-xs">Noch kein Konto? <Text className="underline" onPress={handleForgotPress}>Hier registrieren</Text></Text>
                    </View>
                </View>
            </ScrollView>
        </Pressable>
    );
}
export default Login;
