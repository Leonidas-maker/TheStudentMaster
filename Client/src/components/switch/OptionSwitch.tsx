// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { Switch, View, Text, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { OptionSwitchProps } from "../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const OptionSwitch: React.FC<OptionSwitchProps> = ({
  title,
  texts,
  iconNames,
  onValueChanges,
  values,
}) => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [isLight, setIsLight] = useState(false);

  // ~~~~~~~~~~~ Use color scheme ~~~~~~~~~~ //
  // Get the current color scheme
  const colorScheme = useColorScheme();

  // Check if the color scheme is light or dark
  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  // Set the icon and thumb color based on the color scheme
  const iconColor = isLight ? "#000000" : "#FFFFFF";
  const thumbColor = isLight ? "#333333" : "#F5F5F5";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="m-4 w-3/4">
      <Text className="text-black dark:text-white text-xl font-bold mb-2">
        {title}
      </Text>
      <View className="bg-light_secondary dark:bg-dark_secondary rounded-lg shadow-md p-4">
        {texts.map((text, index) => (
          <View key={index}>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Icon name={iconNames[index]} size={20} color={iconColor} />
                <Text className="text-black dark:text-white font-bold text-lg ml-2">
                  {text}
                </Text>
              </View>
              <Switch
                onValueChange={onValueChanges[index]}
                value={values[index]}
                thumbColor={thumbColor}
                className="ml-3"
              />
            </View>
            {index < texts.length - 1 && (
              <View className="border-b border-light_primary dark:border-dark_primary my-2" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default OptionSwitch;
