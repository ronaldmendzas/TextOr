import { useI18nStore } from "@/i18n";

export function useI18n() {
  const { language, setLanguage, t } = useI18nStore();
  return { language, setLanguage, t };
}
