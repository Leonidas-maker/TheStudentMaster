// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { Pressable, View } from "react-native";

// ~~~~~~~~~~ Own components imports ~~~~~~~~~ //
import DefaultText from "../textFields/DefaultText";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { RadioOptionProps } from "../../interfaces/componentInterfaces";

const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  onPress,
  checked,
  radioColor,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
      }}
      className="active:opacity-50"
    >
      <View
        style={{
          height: 24,
          width: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: radioColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: radioColor,
            }}
          />
        ) : null}
      </View>
      <View className="m-3">
        <DefaultText text={label} />
      </View>
    </Pressable>
  );
};

export default RadioOption;
