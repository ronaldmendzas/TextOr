import { useState, useCallback, useRef } from "react";
import {
  autocorrectText,
  getAutocompleteSuggestions,
  detectLanguage,
  AutocorrectResult,
  AutocompleteResult,
} from "@/lib/ai-service";

interface UseAIAssistantOptions {
  debounceMs?: number;
  minTextLength?: number;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const { debounceMs = 1500, minTextLength = 10 } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [autocorrectResult, setAutocorrectResult] = useState<AutocorrectResult | null>(null);
  const [autocompleteResult, setAutocompleteResult] = useState<AutocompleteResult | null>(null);
  const [detectedLang, setDetectedLang] = useState<string>("en");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef<string>("");

  const requestAutocorrect = useCallback(
    async (text: string) => {
      if (text.length < minTextLength) {
        setAutocorrectResult(null);
        return null;
      }

      if (text === lastTextRef.current) {
        return autocorrectResult;
      }

      lastTextRef.current = text;
      setIsProcessing(true);

      try {
        const result = await autocorrectText(text);
        setAutocorrectResult(result);
        setDetectedLang(result.detectedLanguage);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [minTextLength, autocorrectResult]
  );

  const requestAutocomplete = useCallback(
    async (text: string, cursorContext: string) => {
      if (text.length < minTextLength) {
        setAutocompleteResult(null);
        return null;
      }

      setIsProcessing(true);

      try {
        const result = await getAutocompleteSuggestions(text, cursorContext);
        setAutocompleteResult(result);
        setShowSuggestions(result.suggestions.length > 0);
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [minTextLength]
  );

  const debouncedAutocorrect = useCallback(
    (text: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        requestAutocorrect(text);
      }, debounceMs);
    },
    [debounceMs, requestAutocorrect]
  );

  const updateDetectedLanguage = useCallback(async (text: string) => {
    const lang = await detectLanguage(text);
    setDetectedLang(lang);
    return lang;
  }, []);

  const acceptSuggestion = useCallback((index: number) => {
    setShowSuggestions(false);
    return autocompleteResult?.suggestions[index] || null;
  }, [autocompleteResult]);

  const dismissSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  const clearResults = useCallback(() => {
    setAutocorrectResult(null);
    setAutocompleteResult(null);
    setShowSuggestions(false);
    lastTextRef.current = "";
  }, []);

  return {
    isProcessing,
    autocorrectResult,
    autocompleteResult,
    detectedLanguage: detectedLang,
    showSuggestions,
    requestAutocorrect,
    requestAutocomplete,
    debouncedAutocorrect,
    updateDetectedLanguage,
    acceptSuggestion,
    dismissSuggestions,
    clearResults,
  };
}
