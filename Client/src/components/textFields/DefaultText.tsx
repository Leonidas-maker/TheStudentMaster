import React from "react";
import { Text } from "react-native";

interface DefaultTextProps {
  text: string;
}

const DefaultText: React.FC<DefaultTextProps> = ({ text }) => {
  return <Text className="text-black dark:text-white">{text}</Text>;
};

export default DefaultText;
