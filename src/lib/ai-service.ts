import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
}

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
  const client = getClient();

  if (!text.trim() || text.length < 3) {
    return {
      correctedText: text,
      detectedLanguage: "unknown",
      corrections: [],
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a spelling and grammar correction assistant. 
Analyze the text, detect its language, and correct any spelling or grammar errors.
Respond ONLY with a JSON object in this exact format:
{
  "correctedText": "the corrected text",
  "detectedLanguage": "en" or "es" or other ISO code,
  "corrections": [
    {"original": "wrong word", "corrected": "right word", "reason": "brief explanation"}
  ]
}
If text is correct, return corrections as empty array.
Preserve the original meaning and style. Only fix actual errors.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AutocorrectResult;
    }

    return {
      correctedText: text,
      detectedLanguage: "unknown",
      corrections: [],
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
  cursorContext: string
): Promise<AutocompleteResult> {
  const client = getClient();

  if (!text.trim() || text.length < 5) {
    return { suggestions: [], context: "" };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an intelligent writing assistant. Based on the text provided, suggest 3 possible completions for the current sentence or thought.
Respond ONLY with a JSON object:
{
  "suggestions": ["completion 1", "completion 2", "completion 3"],
  "context": "brief context detected"
}
Keep suggestions short (5-15 words max each). Match the language and tone of the input.`,
        },
        {
          role: "user",
          content: `Text so far: "${text}"\nCursor position context: "${cursorContext}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AutocompleteResult;
    }

    return { suggestions: [], context: "" };
  } catch (error) {
    console.error("Autocomplete error:", error);
    return { suggestions: [], context: "" };
  }
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
