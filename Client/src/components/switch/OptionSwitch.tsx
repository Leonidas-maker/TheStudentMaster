import React from "react";
import { Switch, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface OptionSwitchProps {
    title: string;
    texts: string[];
    iconNames: string[];
    onValueChanges: ((value: boolean) => void)[];
    values: boolean[];
}

const OptionSwitch: React.FC<OptionSwitchProps> = ({
    title,
    texts,
    iconNames,
    onValueChanges,
    values
}) => {
    return (
        <View className="m-4">
            <Text className="text-font_primary text-xl font-bold mb-2">{title}</Text>
            <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
                {texts.map((text, index) => (
                    <View key={index}>
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Icon name={iconNames[index]} size={20} color="#E0E0E2" />
                                <Text className="text-font_primary font-bold text-lg ml-2">{text}</Text>
                            </View>
                            <Switch
                                onValueChange={onValueChanges[index]}
                                value={values[index]}
                            />
                        </View>
                        {index < texts.length - 1 && <View className="border-b border-gray-700 my-2" />}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default OptionSwitch;