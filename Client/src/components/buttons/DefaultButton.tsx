import React from "react";
import { Pressable, Text } from "react-native";

interface DefaultButtonProps {
  text?: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  delayLongPress?: number;
  unstable_pressDelay?: number;
  isCancel?: boolean;
}

const DefaultButton: React.FC<DefaultButtonProps> = ({
  text = "Drück mich",
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  disabled = false,
  delayLongPress = 500,
  unstable_pressDelay = 1,
  isCancel = false,
}) => {
  return (
    <Pressable
      className={
        isCancel
          ? "bg-neutral-300 w-3/4 h-10 rounded-xl justify-center items-center active:bg-neutral-600"
          : "bg-light_action dark:bg-dark_action w-3/4 h-10 rounded-xl justify-center items-center active:bg-light_action_active dark:active:bg-dark_action_active"
      }
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      disabled={disabled}
      delayLongPress={delayLongPress}
      unstable_pressDelay={unstable_pressDelay}
    >
      <Text className="text-black">{text}</Text>
    </Pressable>
  );
};

export default DefaultButton;
