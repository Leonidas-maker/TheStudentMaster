import React, { useState, useEffect } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NavigatorProps } from "../../interfaces/componentInterfaces";

const Navigator: React.FC<NavigatorProps> = ({
  title,
  onPressFunctions,
  texts,
  iconNames,
  isExternalLink = [],
}) => {
  const effectiveIsExternalLink =
    isExternalLink.length === 0 ? texts.map(() => false) : isExternalLink;

  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const iconColor = isLight ? "#000000" : "#FFFFFF";

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
