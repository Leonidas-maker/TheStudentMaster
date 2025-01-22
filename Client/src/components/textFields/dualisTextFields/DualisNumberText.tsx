// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { Text } from "react-native";

// ~~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { TextProps } from "../../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DualisNumberText: React.FC<TextProps> = ({ text }) => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <Text className="text-md font-bold text-black dark:text-white">{text}</Text>
  );
};

export default DualisNumberText;
