import React from "react";
import { Text } from "react-native";

interface SubheadingProps {
  text: string;
}

const Subheading: React.FC<SubheadingProps> = ({ text }) => {
  return (
    <Text className="text-font_secondary text-2xl text-center">{text}</Text>
  );
};

export default Subheading;
