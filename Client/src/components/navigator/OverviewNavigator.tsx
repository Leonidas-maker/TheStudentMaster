import { Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

function OverviewNavigator() {
    const navigation = useNavigation<any>();

    const handleLoadingPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Loading' })
    };

    const handleSettingsPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Settings' })
    };

    const { t } = useTranslation();

    return (
        <View className="m-4">
            <Text className="text-font_primary text-xl font-bold mb-2">All Pages</Text>
            <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                <TouchableOpacity
                    onPress={handleLoadingPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="hourglass-empty" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Loading</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleSettingsPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="settings" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Settings</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default OverviewNavigator;
