import React from "react";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { View } from "react-native";

import EmailDrawer from "./EmailDrawer";
import EmailDetailsScreen from "./EmailDetails";
import { EmailStackParamList } from "../../types/emailScreenTypes";


const Stack = createStackNavigator<EmailStackParamList>();

const Email: React.FC = () => {
  return (
      <Stack.Navigator
        screenOptions={{
          ...TransitionPresets.SlideFromRightIOS,
          transitionSpec: {
            open: { animation: "timing", config: { duration: 300 } },
            close: { animation: "timing", config: { duration: 300 } },
          },
        }}
      >
        {/* Drawer Navigation */}
        <Stack.Screen
          name="EmailDrawer"
          component={EmailDrawer}
          options={{ headerShown: false }}
        />
        {/* E-Mail Details Screen */}
        <Stack.Screen
          name="EmailDetails"
          component={EmailDetailsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
  );
};

export default Email;
