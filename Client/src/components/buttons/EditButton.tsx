// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import { Pressable, useColorScheme } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { EditButtonProps } from "../../interfaces/componentInterfaces";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
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

  // Set icon color based on color scheme
  const iconColor = isLight ? "#000000" : "#FFFFFF";

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
