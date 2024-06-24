// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { Text } from "react-native";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { TextButtonProps } from "../../interfaces/ComponentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const TextButton: React.FC<TextButtonProps> = ({
  text = "Drück mich",
  onPress,
}) => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
