import React from 'react';
import { View } from 'react-native';
import 'nativewind';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';

//* Weeks needs to be passed functions for onBackPress, onForwardPress and onTodayPress
const Weeks: React.FC<{ onBackPress: () => void; onForwardPress: () => void; onTodayPress: () => void; }> = ({ onBackPress, onForwardPress, onTodayPress }) => {
    return (
        <View className="flex-row justify-between px-5 py-3">
            <TouchableOpacity onPress={onBackPress}>
                <Icon name="arrow-back-ios" size={30} color="#E0E0E2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onTodayPress}>
                <Icon name="today" size={30} color="#E0E0E2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onForwardPress}>
                <Icon name="arrow-forward-ios" size={30} color="#E0E0E2" />
            </TouchableOpacity>
        </View>
    );
};

export default Weeks;
