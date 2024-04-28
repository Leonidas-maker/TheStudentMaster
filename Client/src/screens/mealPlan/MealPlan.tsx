import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

import MenuPlan from "../../components/menuPlan/MenuPlan";

function MealPlan() {

    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-primary">
            <MenuPlan />
        </View>
    );
}

export default MealPlan;