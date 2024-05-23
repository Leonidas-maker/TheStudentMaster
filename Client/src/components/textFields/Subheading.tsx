import React from "react";
import { Text } from "react-native";
import { TextProps } from "../../interfaces/componentInterfaces";

const Subheading: React.FC<TextProps> = ({ text }) => {
  return (
    <Text className="text-light_subheading dark:text-dark_subheading text-2xl text-center">
      {text}
    </Text>
  );
};

export default Subheading;
