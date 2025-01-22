// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { Text } from "react-native";

// ~~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { TextProps } from "../../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DualisHeaderDescText: React.FC<TextProps> = ({ text }) => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <Text className="text-lg font-bold w-1/6 text-center text-black dark:text-white">
      {text}
    </Text>
  );
};

export default DualisHeaderDescText;
