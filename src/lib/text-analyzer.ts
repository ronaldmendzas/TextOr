import type { WritingAnalysis, QualityMetrics } from '@/types/analysis';

const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
]);

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
  'perfect', 'love', 'beautiful', 'best', 'happy', 'joy', 'brilliant',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor',
  'disappointing', 'sad', 'angry', 'frustrating', 'problem', 'issue',
]);

const WORDS_PER_MINUTE = 225;

export class TextAnalyzer {
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  analyze(): WritingAnalysis {
    const words = this.getWords();
    const sentences = this.getSentences();
    const paragraphs = this.getParagraphs();

    return {
      wordCount: words.length,
      characterCount: this.text.length,
      readingTime: this.calculateReadingTime(words.length),
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      wordDensity: this.calculateWordDensity(words),
      sentiment: this.analyzeSentiment(words).sentiment,
      sentimentScore: this.analyzeSentiment(words).score,
    };
  }

  getQualityMetrics(): QualityMetrics {
    const words = this.getWords();
    const sentences = this.getSentences();
    const paragraphs = this.getParagraphs();

    return {
      averageWordsPerSentence: words.length / (sentences.length || 1),
      averageSentencesPerParagraph: sentences.length / (paragraphs.length || 1),
      mostUsedWords: this.getMostUsedWords(words, 10),
    };
  }

  private getWords(): string[] {
    return this.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private getSentences(): string[] {
    return this.text
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0);
  }

  private getParagraphs(): string[] {
    return this.text
      .split(/\n\n+/)
      .filter(para => para.trim().length > 0);
  }

  private calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / WORDS_PER_MINUTE);
  }

  private calculateWordDensity(words: string[]): Map<string, number> {
    const density = new Map<string, number>();
    const meaningfulWords = words.filter(word => !STOP_WORDS.has(word));

    meaningfulWords.forEach(word => {
      density.set(word, (density.get(word) || 0) + 1);
    });

    return density;
  }

  private getMostUsedWords(
    words: string[],
    limit: number
  ): Array<{ word: string; count: number }> {
    const density = this.calculateWordDensity(words);
    return Array.from(density.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private analyzeSentiment(words: string[]): {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
  } {
    let score = 0;

    words.forEach(word => {
      if (POSITIVE_WORDS.has(word)) score++;
      if (NEGATIVE_WORDS.has(word)) score--;
    });

    const normalizedScore = score / (words.length || 1);

    if (normalizedScore > 0.05) {
      return { sentiment: 'positive', score: normalizedScore };
    } else if (normalizedScore < -0.05) {
      return { sentiment: 'negative', score: normalizedScore };
    }

    return { sentiment: 'neutral', score: normalizedScore };
  }
}
