export interface AutocorrectResult {
  correctedText: string;
  detectedLanguage: string;
  corrections: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
}

export interface AutocompleteResult {
  suggestions: string[];
  context: string;
}

export async function autocorrectText(text: string): Promise<AutocorrectResult> {
  if (!text.trim() || text.length < 3) {
    return {
      correctedText: text,
      detectedLanguage: "unknown",
      corrections: [],
    };
  }

  try {
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text: text,
        language: "auto",
      }),
    });

    if (!response.ok) {
      throw new Error("LanguageTool API error");
    }

    const data = await response.json();
    const corrections: Array<{ original: string; corrected: string; reason: string }> = [];
    let correctedText = text;
    let offset = 0;

    for (const match of data.matches || []) {
      if (match.replacements && match.replacements.length > 0) {
        const original = text.substring(match.offset, match.offset + match.length);
        
        const isLowerCase = original === original.toLowerCase();
        const isUpperCase = original === original.toUpperCase() && original.length > 1;
        let replacement = "";
        
        for (const rep of match.replacements) {
          const repValue = rep.value;
          const isRepAllCaps = repValue === repValue.toUpperCase() && repValue.length > 1;
          const isRepLowerCase = repValue === repValue.toLowerCase();
          
          if (isLowerCase && isRepAllCaps) {
            continue;
          }
          
          if (isLowerCase && isRepLowerCase) {
            replacement = repValue;
            break;
          }
          
          if (isUpperCase && isRepAllCaps) {
            replacement = repValue;
            break;
          }
          
          if (!replacement) {
            replacement = repValue;
          }
        }
        
        if (!replacement) {
          continue;
        }

        corrections.push({
          original,
          corrected: replacement,
          reason: match.shortMessage || match.message || "Spelling",
        });

        const start = match.offset + offset;
        const end = start + match.length;
        correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
        offset += replacement.length - match.length;
      }
    }

    const detectedLang = data.language?.detectedLanguage?.code || "en";

    return {
      correctedText,
      detectedLanguage: detectedLang.split("-")[0],
      corrections,
    };
  } catch (error) {
    console.error("Autocorrect error:", error);
    return {
      correctedText: text,
      detectedLanguage: "unknown",
      corrections: [],
    };
  }
}

export async function getAutocompleteSuggestions(
  text: string,
  _cursorContext: string
): Promise<AutocompleteResult> {
  return { suggestions: [], context: text };
}

export async function detectLanguage(text: string): Promise<string> {
  if (!text.trim() || text.length < 10) {
    return "en";
  }

  const spanishPatterns = /\b(el|la|los|las|de|en|que|es|un|una|por|para|con|del|al)\b/gi;
  const englishPatterns = /\b(the|is|are|was|were|have|has|had|will|would|can|could|this|that|with)\b/gi;

  const spanishMatches = (text.match(spanishPatterns) || []).length;
  const englishMatches = (text.match(englishPatterns) || []).length;

  return spanishMatches > englishMatches ? "es" : "en";
}
