import React from 'react';
import { Dimensions, Image, ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import Heading from '../../components/textFields/Heading';
import Subheading from '../../components/textFields/Subheading';

const { width, height } = Dimensions.get('window');

interface OnboardingPageProps {
  index: number;
  title: string;
  description: string;
  image: ImageSourcePropType;
  scrollX: Animated.SharedValue<number>;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ index, title, description, image, scrollX }) => {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyles = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width, 0, -width],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolate.CLAMP);

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  return (
    <Animated.View style={[animatedStyles, { width, height }]} className="justify-center items-center bg-light_primary dark:bg-dark_primary">
      <Image source={image} className="w-50 h-50 resize-contain" />
      <Heading text={title} />
      <Subheading text={description} />
    </Animated.View>
  );
};

export default OnboardingPage;