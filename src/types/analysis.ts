export interface WritingAnalysis {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  sentenceCount: number;
  paragraphCount: number;
  wordDensity: Map<string, number>;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
}

export interface QualityMetrics {
  averageWordsPerSentence: number;
  averageSentencesPerParagraph: number;
  mostUsedWords: Array<{ word: string; count: number }>;
}
