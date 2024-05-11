import React, { useEffect, useState } from "react";
import { Switch, View, Text, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface OptionSwitchProps {
  title: string;
  texts: string[];
  iconNames: string[];
  onValueChanges: ((value: boolean) => void)[];
  values: boolean[];
}

const OptionSwitch: React.FC<OptionSwitchProps> = ({
  title,
  texts,
  iconNames,
  onValueChanges,
  values,
}) => {
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
  const thumbColor = isLight ? "#333333" : "#F5F5F5";

  return (
    <View className="m-4">
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
