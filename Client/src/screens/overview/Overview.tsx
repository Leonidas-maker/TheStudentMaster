import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import { styled } from "nativewind";
import { expo } from "../../../app.json";

import ModuleNavigator from "../../components/navigator/ModuleNavigator";
import OverviewNavigator from "../../components/navigator/OverviewNavigator";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

function Overview(props: any) {
    const { t } = useTranslation();

    return (
        <StyledScrollView className='h-screen bg-primary'>
            <ModuleNavigator />
            <OverviewNavigator />
            <StyledView className='justify-center items-center my-2'>
                <StyledText className='text-white'>App Version: {expo.version} ❤️</StyledText>
            </StyledView>
        </StyledScrollView>
    );
}

export default Overview;
