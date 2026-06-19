import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { resources, namespaces, defaultNamespace } from "./resources";
import { DEFAULT_LANGUAGE, dirFor, LANGUAGES } from "./config";

let initialized = false;

function applyHtmlAttrs(lng: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("lang", lng);
  root.setAttribute("dir", dirFor(lng));
}

/**
 * Initialise i18next once. Idempotent — safe to call from any app entry.
 * Returns the configured i18n instance.
 */
export function initI18n() {
  if (initialized) return i18n;
  initialized = true;

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      ns: [...namespaces],
      defaultNS: defaultNamespace,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: LANGUAGES.map((l) => l.code),
      // Backend may return non-translated labels; treat them as keys with the
      // raw label being the default value.
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator", "htmlTag"],
        caches: ["localStorage"],
        lookupLocalStorage: "i18nextLng",
      },
      returnNull: false,
    });

  applyHtmlAttrs(i18n.language || DEFAULT_LANGUAGE);
  i18n.on("languageChanged", applyHtmlAttrs);

  return i18n;
}

export { i18n };
