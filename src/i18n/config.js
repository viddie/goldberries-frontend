import i18n from "i18next";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import { CURRENT_VERSION, IS_DEBUG } from "../util/constants";

export const LANGUAGES = [
  { code: "en", name: "English", flagCode: "en" },
  { code: "de", name: "German", flagCode: "de" },
  { code: "cn", name: "Chinese", flagCode: "cn" },
  { code: "fr", name: "French", flagCode: "fr" },
  { code: "ru", name: "Russian", flagCode: "ru" },
  { code: "ko", name: "Korean", flagCode: "kr" },
];

const DETECTION_OPTIONS = {
  order: ["localStorage", "navigator"],
  caches: ["localStorage"],
};

i18n
  .use(LanguageDetector)
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${CURRENT_VERSION}`,
    },
    // lng: "en",
    fallbackLng: "en",
    detection: DETECTION_OPTIONS,
    supportedLngs: LANGUAGES.map((lang) => lang.code),
    debug: IS_DEBUG,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
