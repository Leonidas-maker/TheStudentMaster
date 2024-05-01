import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TextInput, TouchableOpacity, Keyboard } from "react-native";

const Login: React.FC = () => {
    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const handleForgotPress = () => {
        console.log("Forgot password pressed");
    }

    return (
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="pt-10 justify-center items-center">
                    <Text className="text-font_primary text-4xl pb-5">Willkommen</Text>
                    <TextInput className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 opacity-50" autoCapitalize="none" autoFocus={true} enterKeyHint="next" placeholder="Nutzername / Email" />
                    <TextInput className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 opacity-50 mt-3" autoCapitalize="none" enterKeyHint="done" placeholder="Passwort" placeholderTextColor={"#733932"} secureTextEntry={true} />
                    <View className="w-3/4 justify-end items-end mt-4">
                        <Text className="text-white text-xs underline" onPress={handleForgotPress}>Passwort vergessen?</Text>
                    </View>
                    <TouchableOpacity className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center mt-10">
                        <Text className="text-black">Login</Text>
                    </TouchableOpacity>
                </View>
                <View className="h-full justify-center items-center">
                    <TouchableOpacity className="w-3/4">
                        <View className="justify-center items-center">
                            <Text className="text-white text-xs">Noch kein Konto? <Text className="underline">Hier registrieren</Text></Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </TouchableOpacity>
    );
}
export default Login;
