import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ChainedBackend from "i18next-chained-backend";
import AsyncStorageBackend from "i18next-async-storage-backend2";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
// In the future i18next-multiload-backend-adapter could be added in order to support multiple languages and namespaces in one backend call

const fallbackLng = "de";
const supportedLngs = ["de", "en"];

i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    supportedLngs,
    ns: ["common"],
    defaultNS: "common",
    // ReactNative already escapes Values
    interpolation: {
      escapeValue: false,
    },
    backend: {
      backends: [
        AsyncStorageBackend, // primary backend using async storage
        HttpBackend, // fallback backend using http
      ],
      backendOptions: [
        {
          prefix: "i18next_res_",
          expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
          versions: {},
        },
        {
          loadPath: "https://thestudentmaster.de/locales/{{lng}}/{{ns}}.json",
        },
      ],
    },
  });

export default i18n;
