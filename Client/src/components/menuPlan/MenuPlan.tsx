import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SelectList } from 'react-native-dropdown-select-list';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
    format,
    startOfWeek,
    addDays,
    parseISO,
} from 'date-fns';

import canteenData from "./testData/canteenSample.json";
import canteenSample from "./testData/sample.json";

interface CanteenProps {
    key: string;
    value: string;
};

interface DishProps {
    dish_type: string;
    dish: string;
    price: string;
    serving_date: string;
};

//! Needs to be split into separate components
//! ScrollView height needs to be adjusted to fit the screen
function MenuPlan() {
    const { t } = useTranslation();
    const [selectedCanteen, setSelectedCanteen] = useState<string>("");
    const [canteenNames, setCanteenNames] = useState<CanteenProps[]>([]);
    const [dishes, setDishes] = useState<DishProps[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const names: CanteenProps[] = canteenData.canteens.map((canteenName, index) => ({
            key: String(index + 1),
            value: canteenName
        }));
        setCanteenNames(names);
    }, []);

    //! Needs to be changed for other canteens
    useEffect(() => {
        if (selectedCanteen === "Mensaria am Schloss") {
            const filteredDishes = canteenSample.menu.filter(dish =>
                format(parseISO(dish.serving_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
            );
            setDishes(filteredDishes);
        } else {
            setDishes([]);
        }
    }, [selectedCanteen, selectedDate]);

    const currentDate = new Date();
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const tabBarHeight = useBottomTabBarHeight();

    return (
        <View className="flex-1">
            <View className="pt-2 px-2">
                <SelectList
                    setSelected={setSelectedCanteen}
                    data={canteenNames}
                    save="value"
                    search={false}
                    placeholder={t("Mensa auswählen")}
                    boxStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                    dropdownStyles={{ backgroundColor: "#444444", borderColor: "#444444" }}
                    dropdownTextStyles={{ color: "#FFFFFF" }}
                    inputStyles={{ color: "#FFFFFF" }}
                />
            </View>
            <View className='flex-row py-3'>
                {Array.from({ length: 5 }).map((_, index) => {
                    const day = addDays(startOfWeekDate, index);
                    const isFirstDay = index === 0;

                    return (
                        <View className="flex-1">
                            {isFirstDay ?
                                <TouchableOpacity key={index} className="items-center pt-2 z-10" onPress={() => setSelectedDate(day)}>
                                    <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                                    <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity key={index} className="items-center pt-2 border-l border-gray-200 z-10" onPress={() => setSelectedDate(day)}>
                                    <Text className='text-lg text-white'>{format(day, "eee")}</Text>
                                    <Text className='text-sm text-white'>{format(day, 'd')}. {format(day, 'LLL')}</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    );
                })}
            </View>
            <ScrollView className="flex-grow" contentContainerStyle={{ paddingBottom: tabBarHeight }}>
                {dishes.map((dish, index) => (
                    <View key={index} className="m-2 p-2 bg-gray-400">
                        <Text>{dish.dish_type}: {dish.dish}</Text>
                        <Text>{dish.price}</Text>
                        <Text>{dish.serving_date}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default MenuPlan;