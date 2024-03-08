import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { styled } from "nativewind";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);

function OverviewNavigator() {
    const navigation = useNavigation<any>();

    const handleLoadingPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Loading' })
    };

    const { t } = useTranslation();

    return (
        <StyledView className="m-4">
            <StyledText className="text-font_primary text-xl font-bold mb-2">All Pages</StyledText>
            <StyledView className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                <StyledTouchableOpacity
                    onPress={handleLoadingPress}
                >
                    <StyledView className="flex-row justify-between items-center">
                        <StyledView className="flex-row items-center">
                            <Icon name="hourglass-empty" size={20} color="#E0E0E2" />
                            <StyledText className="text-font_primary font-bold text-lg ml-2">Loading</StyledText>
                        </StyledView>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </StyledView>
                </StyledTouchableOpacity>
            </StyledView>
        </StyledView>
    );
}

export default OverviewNavigator;
