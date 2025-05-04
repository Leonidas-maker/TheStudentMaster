// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { Dimensions, Image, ImageSourcePropType } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from "react-native-reanimated";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import Heading from "../../components/textFields/Heading";
import Subheading from "../../components/textFields/Subheading";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { OnboardingPageProps } from "../../interfaces/componentInterfaces";

// Set the width and height of the screen
const { width, height } = Dimensions.get("window");

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const OnboardingPage: React.FC<OnboardingPageProps> = ({
  index,
  title,
  description,
  image,
  scrollX,
}) => {
  // Set the input range based on the index and width
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // ====================================================== //
  // ====================== Animation ===================== //
  // ====================================================== //
  // Set the animated styles for the onboarding pages
  // This will animate the pages to slide
  const animatedStyles = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width, 0, -width],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <Animated.View
      style={[animatedStyles, { width, height }]}
      className="justify-center items-center bg-light_primary dark:bg-dark_primary"
    >
      <Image source={image} className="w-50 h-50 resize-contain" />
      <Heading text={title} />
      <Subheading text={description} />
    </Animated.View>
  );
};

export default OnboardingPage;
