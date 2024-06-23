// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React from "react";
import { View, ScrollView } from "react-native";

// ~~~~~~~~ Own components imports ~~~~~~~ //
import DefaultText from "../../components/textFields/DefaultText";

// ====================================================== //
// ====================== Component ===================== //
// ====================================================== //
const Support: React.FC = () => {
  // ====================================================== //
  // ================== Return component ================== //
  // ====================================================== //
  return (
    <ScrollView className="h-screen bg-light_primary dark:bg-dark_primary">
      <View>
        <DefaultText text="Welcome to the Support page" />
      </View>
    </ScrollView>
  );
};

export default Support;
