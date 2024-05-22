import React, { useState, useEffect } from "react";
import { Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface EditButtonProps {
  icon?: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  delayLongPress?: number;
  unstable_pressDelay?: number;
  isCancel?: boolean;
}

const EditButton: React.FC<EditButtonProps> = ({
  icon = "edit",
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  disabled = false,
  delayLongPress = 500,
  unstable_pressDelay = 1,
  isCancel = false,
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

  return (
    <Pressable
      className={
        isCancel
          ? "bg-neutral-300 w-3/4 h-10 rounded-xl justify-center items-center active:bg-neutral-600 aspect-square"
          : "bg-light_action dark:bg-dark_action w-3/4 h-10 rounded-xl justify-center items-center active:bg-light_action_active dark:active:bg-dark_action_active m-2 aspect-square"
      }
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      disabled={disabled}
      delayLongPress={delayLongPress}
      unstable_pressDelay={unstable_pressDelay}
    >
      <Icon name={icon} size={30} color={iconColor} />
    </Pressable>
  );
};

export default EditButton;
