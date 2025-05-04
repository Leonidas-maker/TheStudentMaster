// ~~~~~~~~~~~~~~~ Imports ~~~~~~~~~~~~~~~ //
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";

// ~~~~~~~~~~~~~~~~ Types ~~~~~~~~~~~~~~~~ //
// Set possible scheme types to light, dark, system
type SchemeType = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: ReactNode;
};

// ====================================================== //
// ====================== Function ====================== //
// ====================================================== //
// Set system scheme if nothing is provided and no provider is used
const ThemeContext = createContext<{
  theme: SchemeType;
  setTheme: (theme: SchemeType) => void;
}>({
  theme: "system",
  setTheme: (theme) => console.warn("No theme provider"),
});

// ====================================================== //
// =================== Export Provider ================== //
// ====================================================== //
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // ====================================================== //
  // ======================= States ======================= //
  // ====================================================== //
  const [theme, setTheme] = useState<SchemeType>("system");
  const { colorScheme, setColorScheme } = useColorScheme();

  // ====================================================== //
  // ===================== useEffects ===================== //
  // ====================================================== //
  // Gets theme from local storage
  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme) {
        setTheme(storedTheme as SchemeType);
      }
    };

    loadTheme();
  }, []);

  // Sets theme in local storage
  useEffect(() => {
    AsyncStorage.setItem("theme", theme);
    setColorScheme(theme);
  }, [theme]);

  // ~~~~~~~~~~~~~~~~ Return ~~~~~~~~~~~~~~~ //
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);