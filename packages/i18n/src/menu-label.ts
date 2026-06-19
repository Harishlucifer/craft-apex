import { useTranslation } from "react-i18next";

/**
 * Translate a backend-supplied menu label. The English label IS the key —
 * mirrors the legacy `props.t(item.label)` pattern. Returns the label
 * unchanged when no translation exists for the current language.
 */
export function useMenuLabel() {
  const { t } = useTranslation("menu");
  return (label: string) => t(label, { defaultValue: label });
}
