// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Modal,
  Platform,
  Pressable,
} from "react-native";
import "nativewind";
import { format, parseISO } from "date-fns";

// ~~~~~~~~~~ Interfaces imports ~~~~~~~~~ //
import { DishMenuProps } from "../../interfaces/CanteenInterfaces";

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
  scrollViewRef: React.RefObject<ScrollView>;
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
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [dishes, setDishes] = useState<DishMenuProps[]>([]);
  // const [modalVisible, setModalVisible] = useState(false);
  // const [isWeb, setIsWeb] = useState(false);

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Checks if the platform is web
  //? For future use
  // useEffect(() => {
  //   if (Platform.OS === "web") {
  //     setIsWeb(true);
  //   } else {
  //     setIsWeb(false);
  //   }
  // }, []);

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
  // =================== Press handlers =================== //
  // ====================================================== //
  // Opens the modal with the dish details
  //? For future use
  // const handleDishPress = () => {
  //   setModalVisible(true);
  // };

  // Closes the modal
  // const handleClosePress = () => {
  //   setModalVisible(false);
  // };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  //? If Modal is implemented add active:opacity-50 to Pressable
  return (
    <ScrollView className="flex-1 active:opacity-50" ref={scrollViewRef}>
      {selectedCanteen ? (
        dishes.length > 0 ? (
          dishes.map((dish, index) => (
            <Pressable
              key={`${dish.dish_type}-${format(parseISO(dish.serving_date), "yyyy-MM-dd")}-${index}`}
              className="flex-1"
            >
              <View
                key={index}
                className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]"
              >
                <Text className="text-black dark:text-white">
                  {dish.dish_type}: {dish.dish}
                </Text>
                <Text className="text-black dark:text-white">{dish.price}</Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]">
            <Text className="text-black dark:text-white">
              Keine Daten verfügbar für {menu?.canteen_name} am{" "}
              {selectedDate.toLocaleDateString("de-DE")}.
            </Text>
          </View>
        )
      ) : (
        <View className="m-2 p-2 bg-light_secondary dark:bg-dark_secondary rounded-xl shadow-[rgba(0,0,0,0.5)_0px_5px_4px_0px]">
          <Text className="text-black dark:text-white">
            Bitte wähle eine Mensa aus.
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
