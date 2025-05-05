import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import enSettings from "./en/settings.json";
import deSettings from "./de/settings.json";
import enCalendar from "./en/calendar.json";
import deCalendar from "./de/calendar.json";
import enOverview from "./en/overview.json";
import deOverview from "./de/overview.json";
import enDualis from "./en/dualis.json";
import deDualis from "./de/dualis.json";
import enRouter from "./en/router.json";
import deRouter from "./de/router.json";
import enMeal from "./en/meal.json";
import deMeal from "./de/meal.json";

const resources = {
  en: {
    settings: enSettings,
    calendar: enCalendar,
    overview: enOverview,
    router: enRouter,
    meal: enMeal,
    dualis: enDualis,
  },
  de: {
    settings: deSettings,
    calendar: deCalendar,
    overview: deOverview,
    router: deRouter,
    meal: deMeal,
    dualis: deDualis,
  },
};

const getLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem("appLanguage");
    if (storedLanguage) {
      return storedLanguage;
    }
    const locales = Localization.getLocales();
    return locales && locales.length > 0 && locales[0].languageCode
      ? locales[0].languageCode
      : "en";
  } catch (error) {
    console.error("Error while loading the app language:", error);
    return "en";
  }
};

const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("appLanguage", language);
  } catch (error) {
    console.error("Error while storing the app language:", error);
  }
};

(async () => {
  const initialLanguage = await getLanguage();
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    ns: ["settings", "calendar", "overview", "router", "meal", "dualis"],
    interpolation: {
      escapeValue: false,
    },
  });

  i18n.on("languageChanged", (lng) => {
    saveLanguage(lng);
  });
})();

export default i18n;
