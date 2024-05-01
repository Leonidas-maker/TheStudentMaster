import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TextInput, Keyboard, TouchableOpacity } from "react-native";

const ForgotPassword: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Du hast dein Passwort vergessen?</Text>
                    <Text className="text-font_primary text-xl py-3 text-center">Setze dein Passwort hier zurück indem du deine EMail Adresse eingibst.</Text>
                    <TextInput className="bg-white w-3/4 h-10 rounded-xl border-2 bosrder-white focus:border-red-500 opacity-50" autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Email" autoComplete="email" />
                    <TouchableOpacity className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center mt-10">
                        <Text className="text-black">Passwort zurücksetzen</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </TouchableOpacity>
    );
}

export default ForgotPassword;