import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Keyboard, Pressable } from "react-native";
import TextFieldInput from "../../../components/textInputs/TextFieldInput";
import DefaultButton from "../../../components/buttons/DefaultButton";

const NewPassword: React.FC = () => {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <Pressable onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Gib dein neues Passwort ein</Text>
                    <TextFieldInput autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Neues Passwort" autoComplete="new-password" secureTextEntry={true} />
                    <TextFieldInput autoCapitalize="none" enterKeyHint="done" placeholder="Neues Passwort wiederholen" autoComplete="new-password" secureTextEntry={true} />
                    <DefaultButton text="Passwort zurücksetzen" />
                </View>
            </ScrollView>
        </Pressable>
    );
}

export default NewPassword;