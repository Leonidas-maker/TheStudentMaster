import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';


const AccountNavigator: React.FC = () => {
    const navigation = useNavigation<any>();

    const handleLoginPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Login' })
    };

    const handleRegistrationPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Registration' })
    };

    const handleForgotPress = () => {
        navigation.navigate('OverviewStack', { screen: 'ForgotPassword' })
    };

    const handleAddMFAPress = () => {
        navigation.navigate('OverviewStack', { screen: 'AddMFA' })
    };

    const handleVerifyLoginPress = () => {
        navigation.navigate('OverviewStack', { screen: 'VerifyLogin' })
    };

    const handleVerifyRegistrationPress = () => {
        navigation.navigate('OverviewStack', { screen: 'VerifyRegistration' })
    };

    const handleVerifyMFAPress = () => {
        navigation.navigate('OverviewStack', { screen: 'VerifyMFA' })
    };

    const handleNewPasswordPress = () => {
        navigation.navigate('OverviewStack', { screen: 'NewPassword' })
    };

    const handleVerifyForgotPress = () => {
        navigation.navigate('OverviewStack', { screen: 'VerifyForgot' })
    };

    const { t } = useTranslation();

    return (
        <View className="m-4">
            <Text className="text-font_primary text-xl font-bold mb-2">Account Management Screens</Text>
            <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                <TouchableOpacity
                    onPress={handleLoginPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Login</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleRegistrationPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Registration</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleForgotPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Forgot Password</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleVerifyForgotPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Verify Forgot</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleNewPasswordPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">New Password</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleAddMFAPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Add MFA</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleVerifyMFAPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Verify MFA</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleVerifyLoginPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Verify Login</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleVerifyRegistrationPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="apps" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Verify Registration</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default AccountNavigator;
