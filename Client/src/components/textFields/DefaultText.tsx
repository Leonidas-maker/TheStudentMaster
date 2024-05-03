import React from "react";
import { Text } from 'react-native';

interface DefaultTextProps {
    text: string;
}

const DefaultText: React.FC<DefaultTextProps> = ({ text }) => {
    return (
        <Text className="text-font_primary">{text}</Text>
    );
};

export default DefaultText;