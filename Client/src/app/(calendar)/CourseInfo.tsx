import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  useColorScheme,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

import { RawEventProp } from "../../interfaces/calendarInterfaces";
import { de } from "date-fns/locale/de";

const CourseInfo = () => {
  const {
    event: rawEvent,
    startTimeString,
    endTimeString,
  } = useLocalSearchParams();
  const event = JSON.parse(
    decodeURIComponent(rawEvent as string),
  ) as RawEventProp;
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation("calendar");

  // State to track the color scheme
  const [isLight, setIsLight] = useState(false);
  const colorScheme = useColorScheme();
  useEffect(() => {
    setIsLight(colorScheme === "light");
  }, [colorScheme]);
  const iconColor = isLight ? "#000000" : "#FFFFFF";

  const handleDismissPress = () => {
    router.dismiss();
  };

  //Convert start time to local date string
  const eventDate = new Date(event.start).toLocaleDateString("de-DE");

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={handleDismissPress}>
          <Icon
            name="close"
            size={30}
            color={iconColor}
            style={{ marginLeft: "auto", marginRight: 15 }}
          />
        </Pressable>
      ),
    });
  }, [navigation, iconColor]);

  return (
    <SafeAreaView className="flex-1 bg-light_primary dark:bg-dark_primary">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Accent Card */}
        <View className={`rounded-3xl p-6 shadow-lg`}>
          {/* Title */}
          <Text className="text-2xl font-bold dark:text-white text-black mb-4">
            {event.summary}
          </Text>

          {/* Divider */}
          <View className="h-px dark:bg-dark_secondary bg-light_secondary mb-4" />

          {/* Detail Rows */}
          <View className="space-y-3">
            {/* Date */}
            <View className="flex-row items-center mb-2">
              <Icon name="event" size={20} color={iconColor} />
              <Text className="ml-2 flex-1 dark:text-white text-black uppercase text-xs">
                {t("date")}
              </Text>
              <Text className="dark:text-white text-black font-semibold">
                {eventDate}
              </Text>
            </View>

            {/* Start */}
            <View className="flex-row items-center mb-2">
              <Icon name="schedule" size={20} color={iconColor} />
              <Text className="ml-2 flex-1 dark:text-white text-black uppercase text-xs">
                {t("start_time")}
              </Text>
              <Text className="dark:text-white text-black font-semibold">
                {startTimeString}
              </Text>
            </View>

            {/* End */}
            <View className="flex-row items-center mb-2">
              <Icon name="schedule" size={20} color={iconColor} />
              <Text className="ml-2 flex-1 dark:text-white text-black uppercase text-xs">
                {t("end_time")}
              </Text>
              <Text className="dark:text-white text-black font-semibold">
                {endTimeString}
              </Text>
            </View>

            {/* Location */}
            {event.location && (
              <View className="flex-row items-center mb-2">
                <Icon name="place" size={20} color={iconColor} />
                <Text className="ml-2 flex-1 dark:text-white text-black uppercase text-xs">
                  {t("location")}
                </Text>
                <Text className="dark:text-white text-black font-semibold">
                  {event.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseInfo;
