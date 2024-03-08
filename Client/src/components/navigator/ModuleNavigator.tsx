import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

function ModuleNavigator() {
    const navigation = useNavigation<any>();

    const handleDashboardPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Dashboard' })
    };

    const handleDualisPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Dualis' })
    };

    const handleFlashcardsPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Flashcards' })
    };

    const handleMealPlanPress = () => {
        navigation.navigate('OverviewStack', { screen: 'MealPlan' })
    };

    const { t } = useTranslation();

    return (
        <StyledView className="m-4">
            <StyledText className="text-font_primary text-xl font-bold mb-2">More Modules</StyledText>
            <StyledView className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                <StyledTouchableOpacity
                    onPress={handleDashboardPress}
                >
                    <StyledView className="flex-row justify-between items-center">
                        <StyledView className="flex-row items-center">
                            <Icon name="dashboard" size={20} color="#E0E0E2" />
                            <StyledText className="text-font_primary font-bold text-lg ml-2">Dashboard</StyledText>
                        </StyledView>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </StyledView>
                </StyledTouchableOpacity>
                <StyledView className="border-b border-gray-700 my-2" />
                <StyledTouchableOpacity
                    onPress={handleDualisPress}
                >
                    <StyledView className="flex-row justify-between items-center">
                        <StyledView className="flex-row items-center">
                            <Icon name="school" size={20} color="#E0E0E2" />
                            <StyledText className="text-font_primary font-bold text-lg ml-2">Dualis</StyledText>
                        </StyledView>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </StyledView>
                </StyledTouchableOpacity>
                <StyledView className="border-b border-gray-700 my-2" />
                <StyledTouchableOpacity
                    onPress={handleFlashcardsPress}
                >
                    <StyledView className="flex-row justify-between items-center">
                        <StyledView className="flex-row items-center">
                            <Icon name="style" size={20} color="#E0E0E2" />
                            <StyledText className="text-font_primary font-bold text-lg ml-2">Flashcards</StyledText>
                        </StyledView>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </StyledView>
                </StyledTouchableOpacity>
                <StyledView className="border-b border-gray-700 my-2" />
                <StyledTouchableOpacity
                    onPress={handleMealPlanPress}
                >
                    <StyledView className="flex-row justify-between items-center">
                        <StyledView className="flex-row items-center">
                            <Icon name="restaurant" size={20} color="#E0E0E2" />
                            <StyledText className="text-font_primary font-bold text-lg ml-2">Meal Plan</StyledText>
                        </StyledView>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </StyledView>
                </StyledTouchableOpacity>
            </StyledView>
        </StyledView>
    );
}

export default ModuleNavigator;
