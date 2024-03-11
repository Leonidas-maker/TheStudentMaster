import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView, Button } from "react-native";

function Dashboard() {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <View>
                <Text className="text-font_primary">Welcome to the Dashboard page</Text>
            </View>
        </ScrollView>
    );
}

export default Dashboard;
