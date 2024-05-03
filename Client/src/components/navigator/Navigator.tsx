import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface NavigatorProps {
  title: string;
  onPressFunctions: (() => void)[];
  texts: string[];
  iconNames: string[];
  isExternalLink?: boolean[];
}

const Navigator: React.FC<NavigatorProps> = ({
  title,
  onPressFunctions,
  texts,
  iconNames,
  isExternalLink = [],
}) => {
  const effectiveIsExternalLink =
    isExternalLink.length === 0 ? texts.map(() => false) : isExternalLink;

  return (
    <View className="m-4">
      <Text className="text-font_primary text-xl font-bold mb-2">{title}</Text>
      <View className="bg-secondary rounded-lg shadow-md p-4 border border-gray-700">
        {texts.map((text, index) => (
          <View key={index}>
            <TouchableOpacity onPress={onPressFunctions[index]}>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Icon name={iconNames[index]} size={20} color="#E0E0E2" />
                  <Text className="text-font_primary font-bold text-lg ml-2">
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
                  color="#E0E0E2"
                />
              </View>
            </TouchableOpacity>
            {index < texts.length - 1 && (
              <View className="border-b border-gray-700 my-2" />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Navigator;
