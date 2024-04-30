import React, { useState, useRef, useEffect} from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TextInput, Keyboard, TouchableOpacity, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";

function VerifyForgot() {

    const { t } = useTranslation();

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

    const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

    useEffect(() => {
        otp.forEach((value, index) => {
            if (value && index < 5 && otp[index + 1].length === 0) {
                inputRefs.current[index + 1]?.focus();
            }
        });
    }, [otp]);

    const handleOtpChange = (text: string, index: number) => {
        if (/^\d?$/.test(text)) {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index].length === 0 && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            setTimeout(() => inputRefs.current[index - 1]?.focus(), 10);
        } else if (e.nativeEvent.key === 'ArrowRight' && index < 5 && otp[index].length > 0) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.nativeEvent.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const isFieldEditable = (index: number) => {
        return index === 0 || otp.slice(0, index).every(val => val.length === 1);
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={dismissKeyboard}>
            <ScrollView className='h-screen bg-primary'>
                <View className="p-3 justify-center items-center">
                    <Text className="text-font_primary text-3xl font-bold text-center">Verifiziere dich um dein Passwort zurückzusetzen</Text>
                    <View className="justify-center items-center flex-row">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <TextInput
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                value={otp[index]}
                                onChangeText={text => handleOtpChange(text, index)}
                                onKeyPress={e => handleKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                editable={isFieldEditable(index)}
                                style={{ width: 40, height: 40 }}
                                className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 opacity-50 text-center m-1"
                            />
                        ))}
                    </View>
                    <TouchableOpacity className="bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center mt-10">
                        <Text className="text-black">Verifizieren</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </TouchableOpacity>
    );
}

export default VerifyForgot;