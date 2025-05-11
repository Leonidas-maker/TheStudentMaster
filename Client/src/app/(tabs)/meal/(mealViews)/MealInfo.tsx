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

interface DishInfo {
  dish_type: string;
  dish: string;
  price: string;
  serving_date: string;
  canteen_name?: string;
}

const MealInfo: React.FC = () => {
  const { dish: rawDish } = useLocalSearchParams();
  const dish = JSON.parse(decodeURIComponent(rawDish as string)) as DishInfo;
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation("meal");

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

  const dateString = new Date(dish.serving_date).toLocaleDateString("de-DE");

  return (
    <SafeAreaView className="flex-1 bg-light_primary dark:bg-dark_primary">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="rounded-3xl p-6">
          <Text className="text-2xl font-bold dark:text-white text-black mb-4">
            {dish.dish}
          </Text>
          <View className="h-px dark:bg-dark_secondary bg-light_secondary mb-4" />

          <View className="space-y-3">
            {/* TYPE */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Icon name="restaurant" size={20} color={iconColor} />
                <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                  {t("type")}
                </Text>
              </View>
              <Text
                className="font-semibold dark:text-white text-black flex-shrink flex-wrap text-right"
                style={{ maxWidth: "60%" }}
              >
                {dish.dish_type}
              </Text>
            </View>

            {/* PRICE */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Icon name="attach-money" size={20} color={iconColor} />
                <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                  {t("price")}
                </Text>
              </View>
              <Text
                className="font-semibold dark:text-white text-black flex-shrink flex-wrap text-right"
                style={{ maxWidth: "60%" }}
              >
                {dish.price}
              </Text>
            </View>

            {/* DATE */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Icon name="event" size={20} color={iconColor} />
                <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                  {t("date")}
                </Text>
              </View>
              <Text
                className="font-semibold dark:text-white text-black flex-shrink flex-wrap text-right"
                style={{ maxWidth: "60%" }}
              >
                {dateString}
              </Text>
            </View>

            {/* CANTEEN */}
            {dish.canteen_name && (
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Icon name="store" size={20} color={iconColor} />
                  <Text className="ml-2 uppercase text-xs dark:text-white text-black">
                    {t("canteen")}
                  </Text>
                </View>
                <Text
                  className="font-semibold dark:text-white text-black flex-shrink flex-wrap text-right"
                  style={{ maxWidth: "60%" }}
                >
                  {dish.canteen_name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MealInfo;
