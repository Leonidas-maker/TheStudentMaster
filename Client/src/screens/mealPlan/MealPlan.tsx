// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import MenuPlan from "../../components/menuPlan/MenuPlan";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const MealPlan: React.FC = () => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <View className="flex-1 bg-light_primary dark:bg-dark_primary">
      <MenuPlan />
    </View>
  );
};

export default MealPlan;
