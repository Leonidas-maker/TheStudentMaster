import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import { expo } from "../../../app.json";

import ModuleNavigator from "../../components/navigator/ModuleNavigator";
import OverviewNavigator from "../../components/navigator/OverviewNavigator";
import ProfileView from "../../components/profileView/ProfileView";

function Overview(props: any) {
    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-primary'>
            <ProfileView />
            <ModuleNavigator />
            <OverviewNavigator />
            <View className='justify-center items-center my-2'>
                <Text className='text-white'>App Version: {expo.version} ❤️</Text>
            </View>
        </ScrollView>
    );
}

export default Overview;
