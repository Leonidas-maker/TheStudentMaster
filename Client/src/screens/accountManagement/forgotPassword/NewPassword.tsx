import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TextInput, Keyboard, TouchableOpacity } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";

const NewPassword: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Gib dein neues Passwort ein</Text>
                    <TextFieldInput autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Neues Passwort" autoComplete="new-password" secureTextEntry={true} />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="done" placeholder="Neues Passwort wiederholen" autoComplete="new-password" secureTextEntry={true} />
                    <TouchableOpacity className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center mt-10">
                        <Text className="text-black">Passwort zurücksetzen</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </TouchableOpacity>
    );
}

export default NewPassword;