import { useTranslation } from "react-i18next";
import { Text, View, ScrollView } from "react-native";

import MenuPlan from "../../components/menuPlan/MenuPlan";

function MealPlan() {

    const { t } = useTranslation();

    return (
        <ScrollView className='h-screen bg-white'>
            <View>
                <MenuPlan />
            </View>
        </ScrollView>
    );
}

export default MealPlan;