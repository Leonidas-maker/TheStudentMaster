import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Keyboard, Pressable } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

const ForgotPassword: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <Pressable onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Du hast dein Passwort vergessen?</Text>
                    <Text className="text-font_primary text-xl py-3 text-center">Setze dein Passwort hier zurück indem du deine EMail Adresse eingibst.</Text>
                    <TextFieldInput autoCapitalize="none" autoFocus={true} enterKeyHint="done" placeholder="Email" autoComplete="email" />
                    <DefaultButton text="Passwort zurücksetzen" />
                </View>
            </ScrollView>
        </Pressable>
    );
}

export default ForgotPassword;