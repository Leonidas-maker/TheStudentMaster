import React from 'react';
import { View, Text } from 'react-native';
import 'nativewind';
import Icon from 'react-native-vector-icons/MaterialIcons';

//! onPress functions needs to be implemented

const Weeks: React.FC = () => {
    return (
        <View className="flex-row justify-between px-5 py-3">
            <Icon name="arrow-back-ios" size={30} color="#E0E0E2" />
            <Icon name="today" size={30} color="#E0E0E2" />
            <Icon name="arrow-forward-ios" size={30} color="#E0E0E2" />
        </View>
    );
};

export default Weeks;
