"use client";

import { useI18n } from "@/hooks";
import { cn } from "@/lib";
import { Languages } from "lucide-react";
import type { Language } from "@/i18n";

export function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <div className="relative flex items-center gap-2">
      <Languages className="h-4 w-4 text-editor-muted" />
      <select
        value={language}
        onChange={handleChange}
        className={cn(
          "appearance-none rounded-md border border-editor-border bg-editor-bg",
          "px-3 py-1.5 pr-8 text-sm text-editor-text",
          "focus:border-editor-accent focus:outline-none focus:ring-1 focus:ring-editor-accent",
          "cursor-pointer"
        )}
        aria-label="Select language"
      >
        <option value="en">{t.language.en}</option>
        <option value="es">{t.language.es}</option>
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-editor-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
