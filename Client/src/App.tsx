import { registerRootComponent } from "expo";
import "react-native-gesture-handler";

import LoadingStack from "./routes/LoadingStack";
import { NavigationContainer } from "@react-navigation/native";
import "../global.css";
import { ThemeProvider } from "./provider/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <LoadingStack />
      </NavigationContainer>
    </ThemeProvider>
  );
}

registerRootComponent(App);
