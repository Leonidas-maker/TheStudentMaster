import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Settings from '../screens/settings/Settings';

const Stack = createStackNavigator();

const SettingsStack: React.FC = () => {
    return (
        <>
            <StatusBar barStyle="light-content" />
            <Stack.Navigator initialRouteName="Settings"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#171717'
                },
                headerTintColor: '#E0E0E2'
            }} >
                <Stack.Screen
                    name="Settings"
                    component={Settings}
                    options={{ headerShown: true }}
                />
            </Stack.Navigator>
        </>
    );
}

export default SettingsStack;