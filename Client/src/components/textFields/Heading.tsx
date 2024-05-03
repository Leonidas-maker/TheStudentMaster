import React from "react";
import { Text } from "react-native";

interface HeadingProps {
  text: string;
}

const Heading: React.FC<HeadingProps> = ({ text }) => {
  return (
    <Text className="text-font_primary text-4xl font-bold text-center">
      {text}
    </Text>
  );
};

export default Heading;
