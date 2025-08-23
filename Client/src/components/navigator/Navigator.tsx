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
    setIsLight(colorScheme === "light");
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
              <View className="flex-row items-center">
                {/* Left Icon */}
                <Icon
                  name={iconNames[index]}
                  size={20}
                  color={iconColor}
                  style={{ marginRight: 8 }}
                />
                {/* Text container to allow wrapping */}
                <View style={{ flex: 1 }}>
                  <Text
                    className="text-black dark:text-white font-bold text-lg"
                    numberOfLines={0}
                  >
                    {text}
                  </Text>
                </View>
                {/* Right Icon */}
                <Icon
                  name={
                    effectiveIsExternalLink[index]
                      ? "open-in-new"
                      : "arrow-forward-ios"
                  }
                  size={20}
                  color={iconColor}
                  style={{ marginLeft: 8 }}
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
