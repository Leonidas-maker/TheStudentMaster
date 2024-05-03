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

// ~~~~~~~~~~~~~~ Interfaces ~~~~~~~~~~~~~ //
interface DishProps {
  menu: {
    canteen_name: string;
    canteen_short_name: string;
    image_url: null;
    menu: {
      dish_type: string;
      dish: string;
      price: string;
      serving_date: string;
    }[];
  };
  scrollViewRef: React.RefObject<ScrollView>;
  selectedCanteen: string;
  selectedDate: Date;
}

interface DishMenuProps {
  dish_type: string;
  dish: string;
  price: string;
  serving_date: string;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Checks if the platform is web
  useEffect(() => {
    if (Platform.OS === "web") {
      setIsWeb(true);
    } else {
      setIsWeb(false);
    }
  }, []);

  // Filters the dishes based on the selected date and canteen
  //! Needs to be changed for other canteens
  useEffect(() => {
    if (selectedCanteen === "Mensaria am Schloss") {
      const filteredDishes = menu.menu.filter(
        (dish) =>
          format(parseISO(dish.serving_date), "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd"),
      );
      setDishes(filteredDishes);
    } else {
      setDishes([]);
    }
  }, [selectedCanteen, selectedDate]);

  // ====================================================== //
  // =================== Press handlers =================== //
  // ====================================================== //
  // Opens the modal with the dish details
  const handleDishPress = () => {
    setModalVisible(true);
  };

  // Closes the modal
  const handleClosePress = () => {
    setModalVisible(false);
  };

  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  //TODO Add pop-up for dish details
  //! menu.canteen_name only returns "Mensaria am Schloss" for now because we only have this data at the moment
  return (
    <ScrollView className="flex-1" ref={scrollViewRef}>
      {dishes.length > 0 ? (
        dishes.map((dish, index) => (
          <Pressable className="flex-1" onPress={handleDishPress}>
            <View
              key={index}
              className="m-2 p-2 bg-gray-400 active:bg-gray-500"
            >
              <Text>
                {dish.dish_type}: {dish.dish}
              </Text>
              <Text>{dish.price}</Text>
              <Text>{dish.serving_date}</Text>
            </View>
          </Pressable>
        ))
      ) : (
        <View className="m-2 p-2 bg-gray-400">
          <Text>
            Keine Daten verfügbar für {menu.canteen_name} am{" "}
            {selectedDate.toLocaleDateString("de-DE")}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default DishView;
