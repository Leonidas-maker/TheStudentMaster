import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';


const ModuleNavigator: React.FC = () => {
    const navigation = useNavigation<any>();

    const handleDashboardPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Dashboard' })
    };

    const handleDualisPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Dualis' })
    };

    const handleMealPlanPress = () => {
        navigation.navigate('OverviewStack', { screen: 'MealPlan' })
    };

    const { t } = useTranslation();

    return (
        <View className="m-4">
            <Text className="text-font_primary text-xl font-bold mb-2">Weitere Module</Text>
            <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                <TouchableOpacity
                    onPress={handleDashboardPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="dashboard" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Dashboard</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleDualisPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="school" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Dualis</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleMealPlanPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="restaurant" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Meal Plan</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default ModuleNavigator;
