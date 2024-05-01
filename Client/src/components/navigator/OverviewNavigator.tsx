import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

//! Icons for GitLab, GitHub and TheMasterCollection need change
const OverviewNavigator: React.FC = () => {
    const navigation = useNavigation<any>();

    //! Placeholder for testing if logout can be set to invisble and visible
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

    const handleLoadingPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Loading' })
    };

    const handleSettingsPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Settings' })
    };

    const handleImprintPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Imprint' })
    };

    const handleCreditsPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Credits' })
    };

    const handleDisclosurePress = () => {
        navigation.navigate('OverviewStack', { screen: 'ResponsibleDisclosure' })
    };

    const handleRegisterPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Registration' })
    };

    const handleLogoutPress = () => {
        //! Insert logic for logout
        setIsUserLoggedIn(false);
    };

    const handleLoginPress = () => {
        //! Insert logic for login
        setIsUserLoggedIn(true);
        navigation.navigate('OverviewStack', { screen: 'Login' })
    };

    const { t } = useTranslation();

    return (
        <View className="m-4">
            <Text className="text-font_primary text-xl font-bold mb-2">Alle Seiten</Text>
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
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleRegisterPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="app-registration" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Registrieren</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleImprintPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="article" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Imprint</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleDisclosurePress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="bug-report" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Responsible Disclosure</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={handleCreditsPress}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="lightbulb" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">Credits</Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={() => Linking.openURL('https://gitlab.com/themastercollection/thestudentmaster')}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="lightbulb" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">GitLab</Text>
                        </View>
                        <Icon name="open-in-new" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={() => Linking.openURL('https://github.com/Leonidas-maker/TheStudentMaster')}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="lightbulb" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">GitHub</Text>
                        </View>
                        <Icon name="open-in-new" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                <View className="border-b border-gray-700 my-2" />
                <TouchableOpacity
                    onPress={() => Linking.openURL('https://themastercollection.de')}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="lightbulb" size={20} color="#E0E0E2" />
                            <Text className="text-font_primary font-bold text-lg ml-2">TheMasterCollection</Text>
                        </View>
                        <Icon name="open-in-new" size={20} color="#E0E0E2" />
                    </View>
                </TouchableOpacity>
                {isUserLoggedIn && (
                    <>
                        <View className="border-b border-gray-700 my-2" />
                        <TouchableOpacity
                            onPress={handleLogoutPress}
                        >
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <Icon name="logout" size={20} color="#E0E0E2" />
                                    <Text className="text-red-500 font-bold text-lg ml-2">Abmelden</Text>
                                </View>
                                <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                            </View>
                        </TouchableOpacity>
                    </>
                )}
                {!isUserLoggedIn && (
                    <>
                        <View className="border-b border-gray-700 my-2" />
                        <TouchableOpacity
                            onPress={handleLoginPress}
                        >
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <Icon name="login" size={20} color="#E0E0E2" />
                                    <Text className="text-green-500 font-bold text-lg ml-2">Anmelden</Text>
                                </View>
                                <Icon name="arrow-forward-ios" size={20} color="#E0E0E2" />
                            </View>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

export default OverviewNavigator;
