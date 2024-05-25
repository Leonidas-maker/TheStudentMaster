import React from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import OnboardingPage from "./OnboardingPage";
import { useNavigation } from "@react-navigation/native";
import OnboardButton from "../../components/buttons/OnboardButton";

const Onboarding = () => {
  const scrollX = useSharedValue(0);
  const navigation = useNavigation<any>();

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
        className="flex-1"
      >
        <OnboardingPage
          index={0}
          title="Welcome"
          description="This is the first page of the onboarding process."
          image={require("../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG.tsx")}
          scrollX={scrollX}
        />
        <OnboardingPage
          index={1}
          title="Stay Connected"
          description="Stay connected with your friends and family."
          image={require("../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG.tsx")}
          scrollX={scrollX}
        />
        <OnboardingPage
          index={2}
          title="Get Started"
          description="Let's get started!"
          image={require("../../../public/images/svg/navigatorIcons/active/ActiveDashboardSVG.tsx")}
          scrollX={scrollX}
        />
      </Animated.ScrollView>
      <View className="absolute bottom-7 left-0 right-0 flex-row justify-center items-center space-x-4">
        <OnboardButton
          text="Überspringen"
          onPress={() => navigation.navigate("HomeBottonStacks")}
        />
        <OnboardButton text="Weiter" onPress={() => console.log("Scroll")} />
      </View>
    </View>
  );
};

export default Onboarding;
