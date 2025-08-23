// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useEffect, useState, useRef } from "react";
import { View, Dimensions, Alert } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import OnboardingPage from "./OnboardingPage";
import OnboardingButton from "../../components/buttons/OnboardingButton";

// Set the width of the screen
const { width } = Dimensions.get("window");

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Onboarding = () => {
  // Set the scroll value
  const scrollX = useSharedValue(0);

  // ~~~~~~~~~~~ Define navigator ~~~~~~~~~~ //
  const navigation = useNavigation<any>();

  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [buttonVisible, setButtonVisible] = useState(false);

  // ====================================================== //
  // ====================== Variables ===================== //
  // ====================================================== //
  const currentPageIndexRef = useRef(0);

  // ====================================================== //
  // ================= Onboarding Content ================= //
  // ====================================================== //
  const pages = [
    {
      title: "TheStudentMaster",
      description:
        "Erfahre hier was dir TheStudentMaster bietet und welche Funktionen in der Zukunft geplant sind",
    },
    {
      title: "Aktueller Vorlesungsplan",
      description:
        "Hier kannst du deinen aktuellen Vorlesungsplan einsehen und in den Einstellungen abändern",
    },
    {
      title: "Mensa Plan",
      description:
        "In TheStudentMaster kannst du die aktuellen Speisepläne aller Mensen in Mannheim einsehen",
    },
    {
      title: "Coming Soon",
      description:
        "In naher Zukunft wird es möglich sein, deine Noten aus Dualis einsehen zu können, die Funktionen der App im Browser zu nutzen und vieles mehr",
    },
    {
      title: "Leg los!",
      description:
        "Drücke auf den grauen Pfeil unten links und wähle deinen Kursplan aus",
    },
  ];

  // Set the total number of pages
  const totalPages = pages.length;

  // ====================================================== //
  // ===================== Functions ====================== //
  // ====================================================== //
  // Scroll handler to set the current page index
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const pageIndex = Math.round(event.contentOffset.x / width);
      if (pageIndex !== currentPageIndexRef.current) {
        currentPageIndexRef.current = pageIndex;
      }
    },
  });

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Set the current page index
  useEffect(() => {
    const pageIndex = Math.round(scrollX.value / width);
    if (pageIndex !== currentPageIndexRef.current) {
      currentPageIndexRef.current = pageIndex;
      setCurrentPageIndex(pageIndex);
      if (currentPageIndexRef.current === totalPages - 1) {
        setButtonVisible(true);
      }
    }
  }, [scrollX.value, currentPageIndexRef.current]);

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  //TODO: Add own Button for next navigate to next page and then to the Settings
  // const handleNextPress = () => {
  //   if (currentPageIndexRef.current === totalPages - 1) {
  //     navigation.reset({
  //       index: 1,
  //       routes: [
  //         { name: "HomeBottomTabs" },
  //         { name: "MiscStack", params: { screen: "Settings" } },
  //       ],
  //     });
  //   }
  // };

  // Handle the next button press
  // Currently just used inside of the skip alert
  const handleNextPress = async () => {
    await AsyncStorage.setItem("onboarding", "true");
    navigation.reset({
      index: 1,
      routes: [
        { name: "HomeBottomTabs" },
        { name: "MiscStack", params: { screen: "Settings" } },
      ],
    });
  };

  // Triggers the skip alert and asks the user if they want to skip the onboarding
  const handleSkipPress = () => {
    Alert.alert(
      "Einführung beenden",
      "Möchtest du die Einführung beenden und zur Kalenderauswahl gelangen?",
      [
        {
          text: "Zurück",
          style: "cancel",
        },
        {
          text: "Zur Auswahl",
          onPress: () => {
            handleNextPress();
          },
          style: "default",
        },
      ],
      { cancelable: false },
    );
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
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
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>
      <View className="absolute bottom-24 left-0 right-0 flex-row justify-center items-center space-x-2">
        {pages.map((_, index) => {
          const scale = useDerivedValue(() => {
            return interpolate(
              scrollX.value / width,
              [index - 1, index, index + 1],
              [1, 1.5, 1],
              Extrapolation.CLAMP,
            );
          });

          const opacity = useDerivedValue(() => {
            return interpolate(
              scrollX.value / width,
              [index - 1, index, index + 1],
              [0.5, 1, 0.5],
              Extrapolation.CLAMP,
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
              className="w-2 h-2 bg-black dark:bg-white rounded-full mx-1"
            />
          );
        })}
      </View>
      <View className="absolute bottom-20 left-0 right-0 flex-row justify-between items-center px-8">
        <OnboardingButton
          onPress={handleSkipPress}
          isSkipButton={true}
          scrollX={scrollX}
          pageIndex={totalPages - 1}
        />
        {/* {buttonVisible &&
          <OnboardingButton
            onPress={handleNextPress}
            scrollX={scrollX}
            pageIndex={totalPages - 1}
          />
        } */}
      </View>
    </View>
  );
};

export default Onboarding;
