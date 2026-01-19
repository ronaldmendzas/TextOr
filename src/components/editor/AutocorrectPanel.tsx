"use client";

import { AlertCircle, Check, X, Languages } from "lucide-react";
import { useI18n } from "@/hooks";
import type { AutocorrectResult } from "@/lib/ai-service";

interface AutocorrectPanelProps {
  result: AutocorrectResult | null;
  onApply: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

export function AutocorrectPanel({
  result,
  onApply,
  onDismiss,
  isVisible,
}: AutocorrectPanelProps) {
  const { t } = useI18n();

  if (!isVisible || !result || result.corrections.length === 0) {
    return null;
  }

  const languageNames: Record<string, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    pt: "Português",
    it: "Italiano",
  };

  return (
    <div className="fixed bottom-4 right-4 bg-editor-bg border border-editor-border rounded-lg shadow-xl p-4 max-w-md z-50">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <span className="font-medium text-editor-text">
          {t.ai?.correctionsFound || "Corrections Found"}
        </span>
        <div className="ml-auto flex items-center gap-1 text-xs text-editor-muted">
          <Languages className="w-3 h-3" />
          {languageNames[result.detectedLanguage] || result.detectedLanguage}
        </div>
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {result.corrections.map((correction, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2 bg-editor-hover rounded-md text-sm"
          >
            <span className="text-red-400 line-through">{correction.original}</span>
            <span className="text-editor-muted">→</span>
            <span className="text-green-400">{correction.corrected}</span>
            <span className="text-xs text-editor-muted ml-auto">{correction.reason}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-editor-accent text-white rounded-md hover:bg-editor-accent/90 transition-colors"
        >
          <Check className="w-4 h-4" />
          {t.ai?.applyAll || "Apply All"}
        </button>
        <button
          onClick={onDismiss}
          className="px-4 py-2 border border-editor-border rounded-md hover:bg-editor-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
