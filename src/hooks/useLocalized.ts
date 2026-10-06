import { useTranslation } from "react-i18next";
import { fallbackLng, normalizeLanguage } from "@/i18n/config";
import type { Localized } from "@/data/works";

/**
 * Resolves bilingual content fields (work titles, disciplines, …) for the
 * active language. Content lives in `src/data/` rather than the locale files
 * because it is data the owner edits directly, not UI chrome.
 */
export function useLocalized() {
  const { i18n } = useTranslation();
  const code = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language) ?? fallbackLng;
  const isChinese = code.toLowerCase().startsWith("zh");

  return {
    code,
    /** Pick the field for the active language. */
    text: (value: Localized) => (isChinese ? value.zh : value.en),
  };
}
