import { create } from "zustand";
import { persist } from "zustand/middleware";
import { en, type TranslationKeys } from "./en";
import { es } from "./es";

export type { TranslationKeys };
export type Language = "en" | "es";

const translations: Record<Language, TranslationKeys> = {
  en,
  es,
};

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (lang: Language) => {
        set({ language: lang, t: translations[lang] });
      },
      t: translations["en"],
    }),
    {
      name: "textor-language",
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.t = translations[state.language];
        }
      },
    }
  )
);
