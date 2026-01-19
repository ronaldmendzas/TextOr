import type {
  Block,
  TextSegment,
  ListItem,
  TableColumn,
  TableRow,
} from "@/types";

type ParagraphBlock = Block<"paragraph">;
type HeadingBlock = Block<"heading">;
type CodeBlock = Block<"code">;
type TableBlock = Block<"table">;
type CalloutBlock = Block<"callout">;
type EmbedBlock = Block<"embed">;
type ImageBlock = Block<"image">;
type QuoteBlock = Block<"quote">;
type ListBlock = Block<"list">;

const WORDS_PER_MINUTE = 200;

function extractTextFromSegments(segments: TextSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}

function extractTextFromListItems(items: ListItem[]): string {
  return items
    .map((item) => {
      const text = extractTextFromSegments(item.content);
      const childrenText = item.children
        ? extractTextFromListItems(item.children)
        : "";
      return text + " " + childrenText;
    })
    .join(" ");
}

function extractTextFromTable(
  columns: TableColumn[],
  rows: TableRow[]
): string {
  const headerText = columns.map((col) => col.header).join(" ");
  const cellsText = rows
    .map((row) =>
      row.cells.map((cell) => extractTextFromSegments(cell.content)).join(" ")
    )
    .join(" ");
  return headerText + " " + cellsText;
}

export function extractTextFromBlock(block: Block): string {
  switch (block.type) {
    case "paragraph": {
      const paragraphBlock = block as ParagraphBlock;
      return extractTextFromSegments(paragraphBlock.data.content);
    }

    case "heading": {
      const headingBlock = block as HeadingBlock;
      return extractTextFromSegments(headingBlock.data.content);
    }

    case "quote": {
      const quoteBlock = block as QuoteBlock;
      return extractTextFromSegments(quoteBlock.data.content);
    }

    case "callout": {
      const calloutBlock = block as CalloutBlock;
      const calloutTitle = calloutBlock.data.title
        ? calloutBlock.data.title + " "
        : "";
      return calloutTitle + extractTextFromSegments(calloutBlock.data.content);
    }

    case "code": {
      const codeBlock = block as CodeBlock;
      return codeBlock.data.code;
    }

    case "list": {
      const listBlock = block as ListBlock;
      return extractTextFromListItems(listBlock.data.items);
    }

    case "table": {
      const tableBlock = block as TableBlock;
      return extractTextFromTable(
        tableBlock.data.columns,
        tableBlock.data.rows
      );
    }

    case "image": {
      const imageBlock = block as ImageBlock;
      return imageBlock.data.caption ?? "";
    }

    case "embed": {
      const embedBlock = block as EmbedBlock;
      return embedBlock.data.title ?? "";
    }

    case "divider":
      return "";

    default:
      return "";
  }
}

export function extractAllText(blocks: Block[]): string {
  return blocks.map(extractTextFromBlock).join("\n\n");
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter((word) => word.length > 0).length;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function countSentences(text: string): number {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 0;
}

export function countParagraphs(blocks: Block[]): number {
  return blocks.filter((block) => {
    if (block.type !== "paragraph") return false;
    const paragraphBlock = block as ParagraphBlock;
    return extractTextFromSegments(paragraphBlock.data.content).trim().length > 0;
  }).length;
}

export function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

export interface WritingStats {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTime: number;
}

export function calculateWritingStats(text: string): WritingStats {
  const wordCount = countWords(text);

  return {
    wordCount,
    characterCount: countCharacters(text),
    sentenceCount: countSentences(text),
    paragraphCount: 0,
    readingTime: calculateReadingTime(wordCount),
  };
}

const STOP_WORDS_EN = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "was", "are", "were", "been", "be", "have",
  "has", "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "must", "shall", "can", "need", "it", "its", "this", "that", "these",
  "those", "i", "you", "he", "she", "we", "they", "them", "him", "her", "us",
  "me", "my", "your", "his", "our", "their", "what", "which", "who", "whom",
  "when", "where", "why", "how", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "no", "not", "only", "same", "so", "than",
  "too", "very", "just",
]);

const STOP_WORDS_ES = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "y", "o", "pero",
  "en", "de", "del", "que", "es", "son", "está", "están", "para", "por",
  "con", "sin", "sobre", "entre", "como", "más", "menos", "muy", "ya",
  "también", "solo", "se", "le", "lo", "me", "te", "nos",
]);

export function calculateWordFrequency(
  text: string,
  _locale: string = "en"
): Record<string, number> {
  const allStopWords = new Set([...STOP_WORDS_EN, ...STOP_WORDS_ES]);

  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !allStopWords.has(word));

  const frequencyMap: Record<string, number> = {};
  for (const word of words) {
    frequencyMap[word] = (frequencyMap[word] ?? 0) + 1;
  }

  return frequencyMap;
}

export interface SentimentResult {
  score: number;
  label: "positive" | "negative" | "neutral";
}

const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", "awesome",
  "love", "happy", "joy", "beautiful", "brilliant", "perfect", "best",
  "incredible", "outstanding", "superb", "magnificent", "delightful", "pleasant",
  "positive", "success", "successful", "win", "winning", "achieve", "accomplished",
  "bueno", "excelente", "increíble", "maravilloso", "fantástico", "amor",
  "feliz", "alegría", "hermoso", "brillante", "perfecto", "mejor", "éxito", "logro",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "horrible", "poor", "worst", "hate", "sad",
  "angry", "ugly", "fail", "failure", "wrong", "mistake", "error", "problem",
  "issue", "difficult", "hard", "negative", "disappointing", "frustrated",
  "annoying", "boring",
  "malo", "terrible", "horrible", "pobre", "peor", "odio", "triste", "enojado",
  "feo", "fracaso", "error", "problema", "difícil", "negativo", "decepcionante",
  "frustrante", "aburrido",
]);

export function analyzeSentiment(text: string): SentimentResult {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter((word) => word.length > 0);

  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) {
      positiveCount++;
    }
    if (NEGATIVE_WORDS.has(word)) {
      negativeCount++;
    }
  }

  const score =
    words.length > 0 ? (positiveCount - negativeCount) / words.length : 0;

  let label: SentimentResult["label"];
  if (score > 0.05) {
    label = "positive";
  } else if (score < -0.05) {
    label = "negative";
  } else {
    label = "neutral";
  }

  return { score, label };
}
