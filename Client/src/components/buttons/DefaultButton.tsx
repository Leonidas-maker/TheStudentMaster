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
          ? "bg-red-500 w-3/4 h-10 rounded-xl border-2 border-red-500 focus:border-white justify-center items-center active:bg-red-600"
          : "bg-white w-3/4 h-10 rounded-xl border-2 border-white focus:border-red-500 justify-center items-center active:bg-gray-300"
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
