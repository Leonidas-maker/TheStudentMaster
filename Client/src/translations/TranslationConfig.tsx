import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend from 'i18next-chained-backend';
import AsyncStoragePlugin from 'i18next-react-native-async-storage';
import XHR from 'i18next-xhr-backend';

import LanguageDetector from 'i18next-browser-languagedetector';

// add plural support
import 'intl-pluralrules'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    fallbackLng: 'de',
    supportedLngs: ['de', 'en'],
    nonExplicitSupportedLngs: true,
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      backends: [
        AsyncStoragePlugin, // primary
        XHR,                // fallback
      ],
      backendOptions: [{
        loadPath: 'locales/{{lng}}/{{ns}}.json',
      }]
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;