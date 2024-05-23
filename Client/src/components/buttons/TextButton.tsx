import React from "react";
import { Text } from "react-native";
import { TextButtonProps } from "../../interfaces/componentInterfaces";

const TextButton: React.FC<TextButtonProps> = ({
  text = "Drück mich",
  onPress,
}) => {
  return (
    <Text
      className="text-black dark:text-white underline active:text-light_subheading dark:active:text-dark_subheading"
      onPress={onPress}
    >
      {text}
    </Text>
  );
};

export default TextButton;
