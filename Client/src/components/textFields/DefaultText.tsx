import React from "react";
import { Text } from "react-native";
import { TextProps } from "../../interfaces/componentInterfaces";

const DefaultText: React.FC<TextProps> = ({ text }) => {
  return <Text className="text-black dark:text-white">{text}</Text>;
};

export default DefaultText;
