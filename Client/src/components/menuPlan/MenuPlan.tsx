import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView } from "react-native";
import { startOfWeek } from 'date-fns';

import DayView from "./DayView";
import DishView from "./DishView";
import CanteenSelect from "./CanteenSelect";

// TODO Implement a function to get the canteen name data from the backend
// TODO Implement a function to get the menu data from the backend
import canteenData from "./testData/canteenSample.json";
import canteenSample from "./testData/sample.json";

function MenuPlan() {
    const { t } = useTranslation();
    const [selectedCanteen, setSelectedCanteen] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState(new Date());

    const currentDate = new Date();
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, [selectedDate]);

    return (
        <View className="flex-1">
            <CanteenSelect canteenNameData={canteenData} setSelectedCanteen={setSelectedCanteen}/>
            <DayView setSelectedDate={setSelectedDate} startOfWeekDate={startOfWeekDate} />
            <DishView menu={canteenSample} scrollViewRef={scrollViewRef} selectedCanteen={selectedCanteen} selectedDate={selectedDate} />
        </View>
    );
}

export default MenuPlan;