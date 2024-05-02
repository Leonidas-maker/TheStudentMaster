import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";
import { expo } from "../../../app.json";
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ProfileView from "../../components/profileView/ProfileView";
import Navigator from "../../components/navigator/Navigator";

const Overview: React.FC = () => {
    const { t } = useTranslation();

    const navigation = useNavigation<any>();

    // ====================================================== //
    // ================== AccountNavigator ================== //
    // ====================================================== //
    const handleLoginPagePress = () => {
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

    const accountTitle = "Account Management Screens";

    const onPressAccountFunctions = [handleLoginPagePress, handleRegistrationPress, handleForgotPress, handleVerifyForgotPress,
        handleNewPasswordPress, handleAddMFAPress, handleVerifyMFAPress, handleVerifyLoginPress, handleVerifyRegistrationPress];

    const accountTexts = ["Login", "Registration", "Forgot Password", "Verify Forgot", "New Password", "Add MFA",
        "Verify MFA", "Verify Login", "Verify Registration",];

    const accountIconNames = ["apps", "apps", "apps", "apps", "apps", "apps", "apps", "apps", "apps"];

    // ====================================================== //
    // =================== ModuleNavigator ================== //
    // ====================================================== //
    const handleDashboardPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Dashboard' })
    };

    const handleDualisPress = () => {
        navigation.navigate('OverviewStack', { screen: 'Dualis' })
    };

    const handleMealPlanPress = () => {
        navigation.navigate('OverviewStack', { screen: 'MealPlan' })
    };

    const moduleTitle = "Weitere Module";

    const onPressModuleFunctions = [handleDashboardPress, handleDualisPress, handleMealPlanPress];

    const moduleTexts = ["Dashboard", "Dualis", "Meal Plan"];

    const moduleIconNames = ["dashboard", "school", "restaurant"];

    // ====================================================== //
    // ================== OverviewNavigator ================= //
    // ====================================================== //
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

    const handleGitLabPress = () => {
        Linking.openURL('https://gitlab.com/themastercollection/thestudentmaster')
    };

    const handleGitHubPress = () => {
        Linking.openURL('https://github.com/Leonidas-maker/TheStudentMaster')
    };

    const handleMasterCollectionPress = () => {
        Linking.openURL('https://themastercollection.de')
    };

    const overviewTitle = "Alle Seiten";

    const onPressOverviewFunctions = [handleLoadingPress, handleSettingsPress, handleRegisterPress, handleImprintPress,
        handleDisclosurePress, handleCreditsPress, handleGitLabPress, handleGitHubPress, handleMasterCollectionPress];

    const overviewTexts = ["Loading", "Settings", "Registrieren", "Imprint", "Responsible Disclosure", "Credits", "GitLab", "GitHub", "TheMasterCollection"];

    //! Icons for GitLab, GitHub and TheMasterCollection need change
    const moduleIcons = ["hourglass-empty", "settings", "app-registration", "article", "bug-report", "lightbulb", "lightbulb", "lightbulb", "lightbulb"];

    const moduleIsExternalLink = [false, false, false, false, false, false, true, true, true];

    return (
        <ScrollView className='h-screen bg-white dark:bg-primary'>
            <ProfileView />
            <Navigator title={moduleTitle} onPressFunctions={onPressModuleFunctions} texts={moduleTexts} iconNames={moduleIconNames} />
            <Navigator title={accountTitle} onPressFunctions={onPressAccountFunctions} texts={accountTexts} iconNames={accountIconNames} />
            <Navigator title={overviewTitle} onPressFunctions={onPressOverviewFunctions} texts={overviewTexts} iconNames={moduleIcons} isExternalLink={moduleIsExternalLink} />
            <View className='justify-center items-center my-2'>
                <Text className='text-white'>App Version: {expo.version} ❤️</Text>
            </View>
        </ScrollView>
    );
}

export default Overview;
