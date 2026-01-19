"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { autocorrectText, getAutocompleteSuggestions } from "@/lib/ai-service";
import type { AutocorrectResult, AutocompleteResult } from "@/lib/ai-service";

interface AIContextValue {
  isEnabled: boolean;
  isProcessing: boolean;
  autocorrectResult: AutocorrectResult | null;
  autocompleteResult: AutocompleteResult | null;
  showCorrections: boolean;
  showSuggestions: boolean;
  detectedLanguage: string;
  toggleAI: () => void;
  requestAutocorrect: (text: string) => Promise<AutocorrectResult | null>;
  requestAutocomplete: (text: string, context: string) => Promise<AutocompleteResult | null>;
  applyCorrections: () => string | null;
  acceptSuggestion: (index: number) => string | null;
  dismissCorrections: () => void;
  dismissSuggestions: () => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autocorrectResult, setAutocorrectResult] = useState<AutocorrectResult | null>(null);
  const [autocompleteResult, setAutocompleteResult] = useState<AutocompleteResult | null>(null);
  const [showCorrections, setShowCorrections] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("en");

  const toggleAI = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const requestAutocorrect = useCallback(
    async (text: string): Promise<AutocorrectResult | null> => {
      if (!isEnabled || text.length < 10) return null;

      setIsProcessing(true);
      try {
        const result = await autocorrectText(text);
        setAutocorrectResult(result);
        setDetectedLanguage(result.detectedLanguage);
        if (result.corrections.length > 0) {
          setShowCorrections(true);
        }
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [isEnabled]
  );

  const requestAutocomplete = useCallback(
    async (text: string, context: string): Promise<AutocompleteResult | null> => {
      if (!isEnabled || text.length < 5) return null;

      setIsProcessing(true);
      try {
        const result = await getAutocompleteSuggestions(text, context);
        setAutocompleteResult(result);
        if (result.suggestions.length > 0) {
          setShowSuggestions(true);
        }
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [isEnabled]
  );

  const applyCorrections = useCallback((): string | null => {
    if (!autocorrectResult) return null;
    setShowCorrections(false);
    return autocorrectResult.correctedText;
  }, [autocorrectResult]);

  const acceptSuggestion = useCallback(
    (index: number): string | null => {
      if (!autocompleteResult?.suggestions[index]) return null;
      setShowSuggestions(false);
      return autocompleteResult.suggestions[index];
    },
    [autocompleteResult]
  );

  const dismissCorrections = useCallback(() => {
    setShowCorrections(false);
    setAutocorrectResult(null);
  }, []);

  const dismissSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setAutocompleteResult(null);
  }, []);

  return (
    <AIContext.Provider
      value={{
        isEnabled,
        isProcessing,
        autocorrectResult,
        autocompleteResult,
        showCorrections,
        showSuggestions,
        detectedLanguage,
        toggleAI,
        requestAutocorrect,
        requestAutocomplete,
        applyCorrections,
        acceptSuggestion,
        dismissCorrections,
        dismissSuggestions,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI(): AIContextValue {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within AIAssistantProvider");
  }
  return context;
}
