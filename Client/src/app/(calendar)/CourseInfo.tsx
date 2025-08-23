import React, { useEffect, useState } from "react";
import {
  Pressable,
  useColorScheme,
  View,
  Text,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";

import { RawEventProp } from "../../interfaces/calendarInterfaces";

const CourseInfo: React.FC = () => {
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

  const [isLight, setIsLight] = useState(false);
  const colorScheme = useColorScheme();
  useEffect(() => {
    setIsLight(colorScheme === "light");
  }, [colorScheme]);
  const iconColor = isLight ? "#000000" : "#FFFFFF";

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => router.dismiss()}>
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

  const eventDate = new Date(event.start).toLocaleDateString("de-DE");

  return (
    <SafeAreaView className="flex-1 bg-light_primary dark:bg-dark_primary">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl p-6">
          <Text className="text-2xl font-bold dark:text-white text-black mb-4">
            {event.summary}
          </Text>
          <View className="h-px dark:bg-dark_secondary bg-light_secondary mb-4" />

          <View className="space-y-3">
            {/* DATE */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Icon name="event" size={20} color={iconColor} />
                <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                  {t("date")}
                </Text>
              </View>
              <Text
                className="dark:text-white text-black font-semibold flex-shrink flex-wrap text-right"
                style={{ maxWidth: "60%" }}
              >
                {eventDate}
              </Text>
            </View>

            {/* START TIME */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Icon name="schedule" size={20} color={iconColor} />
                <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                  {t("start_time")}
                </Text>
              </View>
              <Text
                className="dark:text-white text-black font-semibold flex-shrink flex-wrap text-right"
                style={{ maxWidth: "60%" }}
              >
                {startTimeString}
              </Text>
            </View>

            {/* END TIME */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Icon name="schedule" size={20} color={iconColor} />
                <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                  {t("end_time")}
                </Text>
              </View>
              <Text
                className="dark:text-white text-black font-semibold flex-shrink flex-wrap text-right"
                style={{ maxWidth: "60%" }}
              >
                {endTimeString}
              </Text>
            </View>

            {/* LOCATION */}
            {event.location && (
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Icon name="place" size={20} color={iconColor} />
                  <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                    {t("location")}
                  </Text>
                </View>
                <Text
                  className="dark:text-white text-black font-semibold flex-shrink flex-wrap text-right"
                  style={{ maxWidth: "60%" }}
                >
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
