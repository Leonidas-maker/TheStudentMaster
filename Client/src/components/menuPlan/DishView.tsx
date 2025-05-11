// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Modal,
  Platform,
  Pressable,
  useColorScheme,
} from "react-native";
import "nativewind";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { DishMenuProps } from "../../interfaces/canteenInterfaces";

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
// Cannot be exported to canteenInterfaces because of the RefObject<ScrollView>
interface DishProps {
  menu: {
    canteen_name: string;
    canteen_short_name: string;
    image_url: string | null;
    menu: {
      dish_type: string;
      dish: string;
      price: string;
      serving_date: string;
    }[];
  } | null;
  scrollViewRef: React.RefObject<ScrollView | null>;
  selectedCanteen: string;
  selectedDate: Date;
}

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DishView: React.FC<DishProps> = ({
  menu,
  scrollViewRef,
  selectedCanteen,
  selectedDate,
}) => {
  const { t } = useTranslation("meal");
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [dishes, setDishes] = useState<DishMenuProps[]>([]);
  const colorScheme = useColorScheme();
  const iconColor = colorScheme !== "light" ? "#FFFFFF" : "#000000";
  const router = useRouter();

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Filters the dishes based on the selected date and canteen
  useEffect(() => {
    if (menu && menu.canteen_short_name === selectedCanteen) {
      const filteredDishes = menu.menu.filter(
        (dish) =>
          format(parseISO(dish.serving_date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd"),
      );
      setDishes(filteredDishes);
    } else {
      setDishes([]);
    }
  }, [menu, selectedCanteen, selectedDate]);

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="flex-1 active:opacity-50" ref={scrollViewRef}>
      {selectedCanteen ? (
        dishes.length > 0 ? (
          dishes.map((dish, index) => (
            <Pressable
              key={`${dish.dish_type}-${format(parseISO(dish.serving_date), "yyyy-MM-dd")}-${index}`}
              className="mx-4 mb-3 bg-light_secondary dark:bg-dark_secondary rounded-lg p-4 shadow-lg"
              onPress={() =>
                router.push(
                  `/meal/MealInfo?dish=${encodeURIComponent(
                    JSON.stringify({
                      ...dish,
                      canteen_name: menu?.canteen_name,
                    }),
                  )}`,
                )
              }
            >
              {/* Row: Icon + Dish Type */}
              <View className="flex-row items-center mb-2">
                <Icon name="restaurant" size={20} color={iconColor} />
                <Text className="ml-2 text-lg font-bold text-black dark:text-white">
                  {dish.dish_type}
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-light_primary dark:bg-dark_primary mb-2" />

              {/* Details Row: Dish name left, Price right */}
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-black dark:text-white flex-1">
                  {dish.dish}
                </Text>
                <Text className="font-semibold text-black dark:text-white ml-4">
                  {dish.price}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View className="mx-4 mb-3 bg-light_secondary dark:bg-dark_secondary rounded-lg p-6 shadow-lg items-center">
            <Icon name="restaurant-menu" size={40} color={iconColor} />
            <Text className="mt-3 text-center text-lg text-black dark:text-white">
              {t("noDataForCanteenOnDate", {
                canteen: menu?.canteen_name,
                date: selectedDate.toLocaleDateString("de-DE"),
              })}
            </Text>
          </View>
        )
      ) : (
        <View className="mx-4 mb-3 bg-light_secondary dark:bg-dark_secondary rounded-lg p-6 shadow-lg items-center">
          <Icon name="info-outline" size={40} color={iconColor} />
          <Text className="mt-3 text-center text-lg text-black dark:text-white">
            {t("noCanteenSelected")}
          </Text>
        </View>
      )}
      {/* <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-center items-center bg-[rgba(0,0,0,0.5)]">
          <View className="bg-white p-5 rounded-lg">
            <Text className="mb-4">Dish Details</Text>
            <Pressable onPress={handleClosePress}>
              <Text className="text-blue-500">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal> */}
    </ScrollView>
  );
};

export default DishView;
