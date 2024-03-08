import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

function MealPlan() {

    const { t } = useTranslation();

    return (
        <StyledScrollView className='h-screen bg-primary'>
            <StyledView>
                <StyledText className="text-font_primary">Welcome to the MealPlan page</StyledText>
            </StyledView>
        </StyledScrollView>
    );
}

export default MealPlan;