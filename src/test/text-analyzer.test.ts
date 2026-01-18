import { TextAnalyzer } from '@/lib/text-analyzer';
import { describe, it, expect } from 'vitest';

describe('TextAnalyzer', () => {
  describe('analyze', () => {
    it('should count words correctly', () => {
      const analyzer = new TextAnalyzer('Hello world test');
      const analysis = analyzer.analyze();
      expect(analysis.wordCount).toBe(3);
    });

    it('should count sentences correctly', () => {
      const analyzer = new TextAnalyzer('Hello world. This is a test. Great!');
      const analysis = analyzer.analyze();
      expect(analysis.sentenceCount).toBe(3);
    });

    it('should calculate reading time', () => {
      const text = 'word '.repeat(225);
      const analyzer = new TextAnalyzer(text);
      const analysis = analyzer.analyze();
      expect(analysis.readingTime).toBe(1);
    });

    it('should detect positive sentiment', () => {
      const analyzer = new TextAnalyzer('This is great excellent amazing wonderful');
      const analysis = analyzer.analyze();
      expect(analysis.sentiment).toBe('positive');
    });

    it('should detect negative sentiment', () => {
      const analyzer = new TextAnalyzer('This is terrible awful bad horrible');
      const analysis = analyzer.analyze();
      expect(analysis.sentiment).toBe('negative');
    });

    it('should detect neutral sentiment', () => {
      const analyzer = new TextAnalyzer('This is a normal text without emotion');
      const analysis = analyzer.analyze();
      expect(analysis.sentiment).toBe('neutral');
    });
  });

  describe('getQualityMetrics', () => {
    it('should calculate average words per sentence', () => {
      const analyzer = new TextAnalyzer('Hello world. Test sentence here.');
      const metrics = analyzer.getQualityMetrics();
      expect(metrics.averageWordsPerSentence).toBeGreaterThan(0);
    });

    it('should identify most used words', () => {
      const analyzer = new TextAnalyzer('test test test word word other');
      const metrics = analyzer.getQualityMetrics();
      expect(metrics.mostUsedWords[0].word).toBe('test');
      expect(metrics.mostUsedWords[0].count).toBe(3);
    });
  });
});
