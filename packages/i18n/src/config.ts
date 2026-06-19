export type Language = "en" | "ar" | "hi" | "ta";

export interface LanguageMeta {
  code: Language;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}

export const LANGUAGES: readonly LanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", dir: "ltr" },
];

export const DEFAULT_LANGUAGE: Language = "en";

export function isRTL(code: string): boolean {
  return LANGUAGES.find((l) => l.code === code)?.dir === "rtl";
}

export function dirFor(code: string): "ltr" | "rtl" {
  return isRTL(code) ? "rtl" : "ltr";
}
