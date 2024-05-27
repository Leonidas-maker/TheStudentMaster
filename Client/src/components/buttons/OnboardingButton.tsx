import React, { useEffect, useState } from "react";
import { Pressable, Text, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";
import { DefaultButtonProps } from "../../interfaces/ComponentInterfaces";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

interface OnboardingButtonProps extends DefaultButtonProps {
  isSkipButton?: boolean;
  scrollX: SharedValue<number>;
  pageIndex: number;
}

const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  text,
  onPress,
  isSkipButton = false,
  scrollX,
  pageIndex,
}) => {
  const colorScheme = useColorScheme();
  const [isLight, setIsLight] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(pageIndex - 1) * width, pageIndex * width, (pageIndex + 1) * width],
      [1, 1.5, 1],
      Extrapolation.CLAMP,
    );

    const widthInterpolated = interpolate(
      scale,
      [1, 1.5],
      [128, 40],
      Extrapolation.CLAMP,
    );

    const heightInterpolated = interpolate(
      scale,
      [1, 1.5],
      [40, 40],
      Extrapolation.CLAMP,
    );

    const borderRadiusInterpolated = interpolate(
      scale,
      [1, 1.5],
      [10, 20],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
      width: widthInterpolated,
      height: heightInterpolated,
      borderRadius: borderRadiusInterpolated,
      justifyContent: "center",
      alignItems: "center",
    };
  });

  useEffect(() => {
    if (colorScheme === "light") {
      setIsLight(true);
    } else {
      setIsLight(false);
    }
  }, [colorScheme]);

  const iconColor = isLight ? "#000000" : "#FFFFFF";

  return (
    <Animated.View style={animatedStyle}>
      {isSkipButton ? (
        <Pressable
          className="w-full h-full justify-center items-center bg-light_secondary dark:bg-dark_secondary rounded-full active:opacity-50"
          onPress={onPress}
        >
          <Icon name="skip-next" size={30} color={iconColor} />
        </Pressable>
      ) : (
        <Pressable
          className="w-full h-full justify-center items-center bg-light_action dark:bg-dark_action rounded-full active:opacity-50"
          onPress={onPress}
        >
          <Icon name="arrow-forward" size={30} color={iconColor} />
        </Pressable>
      )}
    </Animated.View>
  );
};

export default OnboardingButton;