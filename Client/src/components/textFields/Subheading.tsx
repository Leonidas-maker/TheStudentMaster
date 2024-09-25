// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { Text } from "react-native";

// ~~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { TextProps } from "../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Subheading: React.FC<TextProps> = ({ text }) => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <Text className="text-light_subheading dark:text-dark_subheading text-2xl text-center m-4">
      {text}
    </Text>
  );
};

export default Subheading;
