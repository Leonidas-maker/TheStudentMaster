import React from "react";
import { Text } from "react-native";
import { TextProps } from "../../interfaces/componentInterfaces";

const Heading: React.FC<TextProps> = ({ text }) => {
  return (
    <Text className="text-black dark:text-white text-4xl font-bold text-center">
      {text}
    </Text>
  );
};

export default Heading;
