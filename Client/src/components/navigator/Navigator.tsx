// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { NavigatorProps } from "../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Navigator: React.FC<NavigatorProps> = ({
  title,
  onPressFunctions,
  texts,
  iconNames,
  isExternalLink = [],
}) => {
  // Check if isExternalLink is empty, if so, set all values to false
  const effectiveIsExternalLink =
    isExternalLink.length === 0 ? texts.map(() => false) : isExternalLink;

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

  // Set the icon color based on the color scheme
  const iconColor = isLight ? "#000000" : "#FFFFFF";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="m-4">
      <Text className="text-black dark:text-white text-xl font-bold mb-2">
        {title}
      </Text>
      <View className="bg-light_secondary dark:bg-dark_secondary rounded-lg shadow-md p-4">
        {texts.map((text, index) => (
          <View key={index}>
            <Pressable
              onPress={onPressFunctions[index]}
              className="active:opacity-50"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Icon name={iconNames[index]} size={20} color={iconColor} />
                  <Text className="text-black dark:text-white font-bold text-lg ml-2">
                    {text}
                  </Text>
                </View>
                <Icon
                  name={
                    effectiveIsExternalLink[index]
                      ? "open-in-new"
                      : "arrow-forward-ios"
                  }
                  size={20}
                  color={iconColor}
                />
              </View>
            </Pressable>
            {index < texts.length - 1 && (
              <View className="border-b border-light_primary dark:border-dark_primary my-2" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Navigator;
