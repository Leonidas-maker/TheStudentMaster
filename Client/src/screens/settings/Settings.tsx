import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { colorScheme } from "nativewind";

type SchemeType = 'light' | 'dark' | 'system';

//? RadioOption Text needs to have style component otherwise it wont change theme
//! System theme does not work
function Settings() {

    const { t } = useTranslation();
    const [currentScheme, setCurrentScheme] = useState<SchemeType>(colorScheme.get() as SchemeType);

    const setScheme = (scheme: SchemeType) => {
        colorScheme.set(scheme);
        setCurrentScheme(scheme);
    };

    const RadioOption = ({ label, onPress, checked }: { label: string, onPress: () => void, checked: boolean }) => (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <View style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {checked ? (
                    <View style={{
                        height: 12,
                        width: 12,
                        borderRadius: 6,
                        backgroundColor: '#fff',
                    }}/>
                ) : null}
            </View>
            <Text style={{ marginLeft: 10 }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView className='h-screen bg-primary dark:bg-white'>
            <View style={{ padding: 20 }}>
                <Text className="text-font_primary dark:text-fuchsia-600">Welcome to the Settings page</Text>
                <RadioOption 
                    label="Light Mode" 
                    onPress={() => setScheme('light')} 
                    checked={currentScheme === 'light'}
                />
                <RadioOption 
                    label="Dark Mode" 
                    onPress={() => setScheme('dark')} 
                    checked={currentScheme === 'dark'}
                />
                <RadioOption 
                    label="System Mode" 
                    onPress={() => setScheme('system')} 
                    checked={currentScheme === 'system'}
                />
            </View>
        </ScrollView>
    );
}

export default Settings;
