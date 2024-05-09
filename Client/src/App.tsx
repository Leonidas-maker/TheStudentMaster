import { registerRootComponent } from "expo";
import "react-native-gesture-handler";

import LoadingStack from "./routes/LoadingStack";
import { NavigationContainer } from "@react-navigation/native";
import "../global.css";

export default function App() {
  return (
    <NavigationContainer>
      <LoadingStack />
    </NavigationContainer>
  );
}

registerRootComponent(App);
