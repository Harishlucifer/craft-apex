import { useTranslation } from "react-i18next";
import { dirFor, isRTL, LANGUAGES, type Language } from "./config";

export function useLanguage() {
  const { i18n } = useTranslation();
  const current = (i18n.language || "en") as Language;
  return {
    language: current,
    dir: dirFor(current),
    isRTL: isRTL(current),
    languages: LANGUAGES,
    setLanguage: (code: Language) => i18n.changeLanguage(code),
  };
}
