import { ScrollView } from "react-native-gesture-handler";

interface DayViewProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    startOfWeekDate: Date;
}

interface DishMenuProps {
    dish_type: string;
    dish: string;
    price: string;
    serving_date: string;
}

interface CanteenProps {
    key: string;
    value: string;
}

interface MenuDataProps {
    canteen_name: string;
    canteen_short_name: string;
    image_url: string | null;
    menu: DishMenuProps[];
}

interface CanteenResponseProps {
    canteen_name: string;
    canteen_short_name: string;
    image_url: string;
}

export { DayViewProps, DishMenuProps, CanteenProps, MenuDataProps, CanteenResponseProps }