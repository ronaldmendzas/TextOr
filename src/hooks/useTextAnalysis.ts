import { useMemo } from "react";
import { useEditorStore } from "@/stores";
import {
  calculateWritingStats,
  calculateWordFrequency,
  analyzeSentiment,
  extractAllText,
} from "@/lib";
import type { WritingStats, SentimentResult } from "@/lib/text-analysis";

interface WordFrequencyItem {
  word: string;
  count: number;
}

interface TextAnalysisResult {
  stats: WritingStats;
  wordFrequency: WordFrequencyItem[];
  sentiment: SentimentResult;
}

export function useTextAnalysis(): TextAnalysisResult {
  const document = useEditorStore((state) => state.document);

  const analysis = useMemo(() => {
    const fullText = extractAllText(document.blocks);
    const stats = calculateWritingStats(fullText);
    const wordFrequencyMap = calculateWordFrequency(fullText, "en");
    const sentiment = analyzeSentiment(fullText);

    const wordFrequency: WordFrequencyItem[] = Object.entries(wordFrequencyMap)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      stats,
      wordFrequency,
      sentiment,
    };
  }, [document]);

  return analysis;
}
