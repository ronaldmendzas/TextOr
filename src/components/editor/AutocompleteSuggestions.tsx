"use client";

import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { useI18n } from "@/hooks";

interface AutocompleteSuggestionsProps {
  suggestions: string[];
  isLoading: boolean;
  onAccept: (index: number) => void;
  onDismiss: () => void;
  position?: { x: number; y: number };
}

export function AutocompleteSuggestions({
  suggestions,
  isLoading,
  onAccept,
  onDismiss,
  position,
}: AutocompleteSuggestionsProps) {
  const { t } = useI18n();

  if (!suggestions.length && !isLoading) {
    return null;
  }

  const style = position
    ? {
        position: "fixed" as const,
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }
    : {};

  return (
    <div
      className="bg-editor-bg border border-editor-border rounded-lg shadow-xl p-3 min-w-[300px] max-w-[500px]"
      style={style}
    >
      <div className="flex items-center gap-2 mb-2 text-sm text-editor-muted">
        <Sparkles className="w-4 h-4 text-editor-accent" />
        <span>{t.ai?.suggestions || "AI Suggestions"}</span>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
        <button
          onClick={onDismiss}
          className="ml-auto p-1 hover:bg-editor-hover rounded"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onAccept(index)}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-editor-hover transition-colors flex items-center gap-2 group"
          >
            <span className="text-sm text-editor-text flex-1">{suggestion}</span>
            <span className="text-xs text-editor-muted opacity-0 group-hover:opacity-100">
              Tab
            </span>
            <Check className="w-4 h-4 text-green-500 opacity-0 group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {!isLoading && suggestions.length === 0 && (
        <p className="text-sm text-editor-muted text-center py-2">
          {t.ai?.noSuggestions || "No suggestions available"}
        </p>
      )}
    </div>
  );
}
