import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import Animated, { useSharedValue, useAnimatedScrollHandler, useDerivedValue, useAnimatedStyle, interpolate, Extrapolate } from "react-native-reanimated";
import OnboardingPage from "./OnboardingPage";
import { useNavigation } from "@react-navigation/native";
import OnboardingButton from "../../components/buttons/OnboardingButton";

const { width } = Dimensions.get("window");

const Onboarding = () => {
  const scrollX = useSharedValue(0);
  const navigation = useNavigation<any>();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const pages = [
    {
      title: "Welcome",
      description: "This is the first page of the onboarding process.",
      image: require("../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG.tsx"),
    },
    {
      title: "Stay Connected",
      description: "Stay connected with your friends and family.",
      image: require("../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG.tsx"),
    },
    {
      title: "Get Started",
      description: "Let's get started!",
      image: require("../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG.tsx"),
    },
  ];

  const totalPages = pages.length;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  return (
    <View className="flex-1">
      <Animated.ScrollView
        horizontal
        pagingEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        className="flex-1"
      >
        {pages.map((page, index) => (
          <OnboardingPage
            key={index}
            index={index}
            title={page.title}
            description={page.description}
            image={page.image}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
      <View className="absolute bottom-12 left-0 right-0 flex-row justify-center items-center space-x-2">
        {pages.map((_, index) => {
          const scale = useDerivedValue(() => {
            return interpolate(
              scrollX.value / width,
              [index - 1, index, index + 1],
              [1, 1.5, 1],
              Extrapolate.CLAMP
            );
          });

          const opacity = useDerivedValue(() => {
            return interpolate(
              scrollX.value / width,
              [index - 1, index, index + 1],
              [0.5, 1, 0.5],
              Extrapolate.CLAMP
            );
          });

          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: scale.value }],
              opacity: opacity.value,
            };
          });

          return (
            <Animated.View
              key={index}
              style={animatedStyle}
              className="w-2 h-2 bg-black rounded-full mx-1"
            />
          );
        })}
      </View>
      <View className="absolute bottom-7 left-0 right-0 flex-row justify-between items-center px-6">
        <OnboardingButton
          text="Überspringen"
          onPress={() => navigation.navigate("HomeBottonStacks")}
          isSkipButton={true}
          scrollX={scrollX}
          pageIndex={0}
        />
        <OnboardingButton
          onPress={() => console.log("Scroll")}
          scrollX={scrollX}
          pageIndex={totalPages - 1}
        />
      </View>
    </View>
  );
};

export default Onboarding;