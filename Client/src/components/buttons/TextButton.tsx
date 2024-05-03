import React from "react";
import { Text } from 'react-native';

interface TextButtonProps {
    text?: string;
    onPress?: () => void;
}

const TextButton: React.FC<TextButtonProps> = ({
    text = "Drück mich",
    onPress
}) => {
    return (
        <Text className="text-font_primary underline active:text-font_secondary" onPress={onPress}>{text}</Text>
    );
};

export default TextButton;