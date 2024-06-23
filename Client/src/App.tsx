// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import { registerRootComponent } from "expo";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ~~~~~~~~~~ Import translation ~~~~~~~~~ //
// Import i18next for localisation
import "./translations/TranslationConfig";

// ~~~~~~~~~~ Import first stack ~~~~~~~~~ //
import LoadingStack from "./routes/LoadingStack";

// ~~~~~~~~~~ Import theme provider ~~~~~~~~~ //
import { ThemeProvider } from "./provider/ThemeProvider";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import applyInterceptor from "./services/ApplyInterceptor";

// ====================================================== //
// ===================== Export App ===================== //
// ====================================================== //
export default function App() {
  // Apply the interceptor
  applyInterceptor();

  // ====================================================== //
  // ================ Return App component ================ //
  // ====================================================== //
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
