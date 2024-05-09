import React from "react";
import { View } from "react-native";

import MenuPlan from "../../components/menuPlan/MenuPlan";

const MealPlan: React.FC = () => {

  return (
    <View className="flex-1 bg-light_primary dark:bg-dark_primary">
      <MenuPlan />
    </View>
  );
};

export default MealPlan;
