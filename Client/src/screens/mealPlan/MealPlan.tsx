import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import MenuPlan from "../../components/menuPlan/MenuPlan";

const MealPlan: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-primary">
      <MenuPlan />
    </View>
  );
};

export default MealPlan;
