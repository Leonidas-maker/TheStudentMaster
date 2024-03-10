import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

function Dashboard() {

    const { t } = useTranslation();

    return (
        <StyledScrollView className='h-screen bg-primary'>
            <StyledView>
                <StyledText className="text-font_primary">Welcome to the Dashboard page</StyledText>
            </StyledView>
        </StyledScrollView>
    );
}

export default Dashboard;