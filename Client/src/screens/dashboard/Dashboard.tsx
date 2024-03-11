import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Button } from "react-native";
import { colorScheme } from "nativewind";

const newScheme = colorScheme.get() === 'light' ? 'dark' : 'light';
colorScheme.set(newScheme);

function Dashboard() {
    const { t } = useTranslation();

    const toggleColorScheme = () => {
        const newScheme = colorScheme.get() === 'light' ? 'dark' : 'light';
        colorScheme.set(newScheme);
    };

    return (
        <ScrollView className='h-screen bg-primary dark:bg-white'>
            <View>
                <Text className="text-font_primary dark:text-fuchsia-600">Welcome to the Dashboard page</Text>
                <Button onPress={toggleColorScheme} title="Toggle Color Scheme" />
            </View>
        </ScrollView>
    );
}

export default Dashboard;
