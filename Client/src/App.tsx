import { registerRootComponent } from "expo";
import "react-native-gesture-handler";

import LoadingStack from "./routes/LoadingStack";
import { NavigationContainer } from "@react-navigation/native";
import "../global.css";
import { ThemeProvider } from "./provider/ThemeProvider";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import i18next for localisation
import "./translations/TranslationConfig";

import applyInterceptor from "./services/ApplyInterceptor";

export default function App() {
  applyInterceptor();

  return (
    <ThemeProvider>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <NavigationContainer>
            <LoadingStack />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

registerRootComponent(App);
