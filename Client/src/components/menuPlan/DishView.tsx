// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import 'nativewind';
import { format, parseISO } from 'date-fns';

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
};

interface DishMenuProps {
    dish_type: string;
    dish: string;
    price: string;
    serving_date: string;
};

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const DishView: React.FC<DishProps> = ({
    menu,
    scrollViewRef,
    selectedCanteen,
    selectedDate
}) => {
    const [dishes, setDishes] = useState<DishMenuProps[]>([]);

    //! Needs to be changed for other canteens
    useEffect(() => {
        if (selectedCanteen === "Mensaria am Schloss") {
            const filteredDishes = menu.menu.filter(dish =>
                format(parseISO(dish.serving_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            );
            setDishes(filteredDishes);
        } else {
            setDishes([]);
        }
    }, [selectedCanteen, selectedDate]);

    // ====================================================== //
    // ================== Return component ================== //
    // ====================================================== //
    return (
        <ScrollView className="flex-1" ref={scrollViewRef}>
            {dishes.map((dish, index) => (
                <View key={index} className="m-2 p-2 bg-gray-400">
                    <Text>{dish.dish_type}: {dish.dish}</Text>
                    <Text>{dish.price}</Text>
                    <Text>{dish.serving_date}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

export default DishView;
