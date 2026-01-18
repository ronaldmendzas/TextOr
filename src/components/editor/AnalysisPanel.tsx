'use client';

import { useEffect, useState } from 'react';
import { type Editor } from '@tiptap/react';
import { X, TrendingUp, Smile, Frown, Minus } from 'lucide-react';
import { TextAnalyzer } from '@/lib/text-analyzer';
import { useAnalysisStore } from '@/store/analysis.store';
import { cn } from '@/lib/utils';

interface AnalysisPanelProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisPanel({ editor, isOpen, onClose }: AnalysisPanelProps) {
  const { setAnalysis, setMetrics, analysis, metrics } = useAnalysisStore();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const updateAnalysis = () => {
      setIsUpdating(true);
      const text = editor.getText();
      const analyzer = new TextAnalyzer(text);
      
      setAnalysis(analyzer.analyze());
      setMetrics(analyzer.getQualityMetrics());
      
      setTimeout(() => setIsUpdating(false), 300);
    };

    updateAnalysis();

    const handler = () => {
      updateAnalysis();
    };

    editor.on('update', handler);

    return () => {
      editor.off('update', handler);
    };
  }, [editor, isOpen, setAnalysis, setMetrics]);

  if (!isOpen) return null;

  const sentimentIcon = {
    positive: Smile,
    negative: Frown,
    neutral: Minus,
  }[analysis?.sentiment || 'neutral'];

  const SentimentIcon = sentimentIcon;

  const sentimentColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  }[analysis?.sentiment || 'neutral'];

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Writing Analysis</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Close analysis panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className={cn('p-4 space-y-6', isUpdating && 'opacity-50 transition-opacity')}>
        {analysis && (
          <>
            <section>
              <h3 className="font-medium text-sm text-gray-700 mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{analysis.wordCount}</div>
                  <div className="text-xs text-gray-600">Words</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{analysis.readingTime}</div>
                  <div className="text-xs text-gray-600">Min Read</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{analysis.sentenceCount}</div>
                  <div className="text-xs text-gray-600">Sentences</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{analysis.paragraphCount}</div>
                  <div className="text-xs text-gray-600">Paragraphs</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-medium text-sm text-gray-700 mb-3">Sentiment</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <SentimentIcon className={cn('w-6 h-6', sentimentColor)} />
                  <span className={cn('font-semibold capitalize', sentimentColor)}>
                    {analysis.sentiment}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  Score: {(analysis.sentimentScore * 100).toFixed(2)}%
                </div>
              </div>
            </section>

            {metrics && (
              <section>
                <h3 className="font-medium text-sm text-gray-700 mb-3">Quality Metrics</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Avg Words/Sentence
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {metrics.averageWordsPerSentence.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Avg Sentences/Paragraph
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {metrics.averageSentencesPerParagraph.toFixed(1)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {metrics && metrics.mostUsedWords.length > 0 && (
              <section>
                <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Most Used Words
                </h3>
                <div className="space-y-2">
                  {metrics.mostUsedWords.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-mono">{item.word}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(item.count / metrics.mostUsedWords[0].count) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
