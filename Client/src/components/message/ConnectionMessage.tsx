import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";

interface ConnectionMessageProps {
    visible: boolean;
    setVisible: (value: boolean) => void;
}

const ConnectionMessage: React.FC<ConnectionMessageProps> = ({ visible, setVisible }) => {
    if (!visible) return null;

    return (
        <Animated.View className='absolute bottom-5 left-4 right-4 bg-red-500 rounded-lg p-4 shadow-lg z-50 opacity-90'>
            <View className='flex-row items-center justify-between'>
                <Text className='text-white text-sm font-medium'>
                    Keine Verbindung zum Server.
                </Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                    <Icon
                        name="cancel"
                        size={20}
                        color={"white"}
                        style={{ marginLeft: "auto", marginRight: 15 }}
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default ConnectionMessage;