// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState } from "react";
import { Pressable, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { OnboardingButtonProps } from "../../interfaces/ComponentInterfaces";


const { width } = Dimensions.get("window");

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  text,
  onPress,
  isSkipButton = false,
  scrollX,
  pageIndex,
  visible = true,
}) => {

  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [isLight, setIsLight] = useState(false);

  // ====================================================== //
  // ====================== Animation ===================== //
  // ====================================================== //
  // Animate the button
  const animatedStyle = useAnimatedStyle(() => {
    // Interpolate the scale of the button
    const scale = interpolate(
      scrollX.value,
      [(pageIndex - 1) * width, pageIndex * width, (pageIndex + 1) * width],
      [1, 1.5, 1],
      Extrapolation.CLAMP,
    );

    // Interpolate the width of the button
    const widthInterpolated = interpolate(
      scale,
      [1, 1.5],
      [128, 40],
      Extrapolation.CLAMP,
    );

    // Interpolate the height of the button
    const heightInterpolated = interpolate(
      scale,
      [1, 1.5],
      [40, 40],
      Extrapolation.CLAMP,
    );

    // Interpolate the border radius of the button
    const borderRadiusInterpolated = interpolate(
      scale,
      [1, 1.5],
      [10, 20],
      Extrapolation.CLAMP,
    );

    // Return the animated style
    return {
      transform: [{ scale }],
      width: widthInterpolated,
      height: heightInterpolated,
      borderRadius: borderRadiusInterpolated,
      justifyContent: "center",
      alignItems: "center",
    };
  });

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

  if (!visible) {
    return <View style={{ width: 128, height: 40 }} />;
  }

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
