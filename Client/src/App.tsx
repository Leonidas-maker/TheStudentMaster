// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import { registerRootComponent } from "expo";
import { useEffect } from "react";
import { Dimensions, Platform } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

// ~~~~~~~~~~ Import translation ~~~~~~~~~ //
// Import i18next for localisation
import "./translations/translationConfig";

// ~~~~~~~~~~ Import first stack ~~~~~~~~~ //
import LoadingStack from "./routes/LoadingStack";

// ~~~~~~~~~~ Import theme provider ~~~~~~~~~ //
import { ThemeProvider } from "./provider/ThemeProvider";

// ~~~~~~~~~~~ Service imports ~~~~~~~~~~~ //
import ApplyInterceptor from "./services/applyInterceptor";

// ====================================================== //
// ===================== Export App ===================== //
// ====================================================== //
export default function App() {
  // Apply the interceptor
  ApplyInterceptor();

  useEffect(() => {
    const { height, width } = Dimensions.get("window");
    const isTablet =
      (Platform.OS === "ios" && (height > 800 || width > 800)) ||
      (Platform.OS === "android" && (height > 800 || width > 800));

    if (isTablet) {
      ScreenOrientation.unlockAsync();
    } else {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
  }, []);

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
