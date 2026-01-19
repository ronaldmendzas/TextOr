"use client";

import { useState, useCallback } from "react";
import { useI18n, useTextAnalysis } from "@/hooks";
import { BarChart3, Smile, Meh, Frown, X } from "lucide-react";
import { cn } from "@/lib";

const SENTIMENT_ICONS = {
  positive: Smile,
  neutral: Meh,
  negative: Frown,
};

const SENTIMENT_CLASSES = {
  positive: "text-green-500",
  neutral: "text-yellow-500",
  negative: "text-red-500",
};

export function WordDensityPanel() {
  const { t } = useI18n();
  const { wordFrequency, sentiment } = useTextAnalysis();
  const [isOpen, setIsOpen] = useState(false);

  const topWords = wordFrequency.slice(0, 10);
  const maxCount = topWords[0]?.count ?? 1;

  const SentimentIcon = SENTIMENT_ICONS[sentiment.label];

  const togglePanel = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <>
      <button
        onClick={togglePanel}
        className="flex items-center gap-1.5 rounded-lg bg-editor-bg px-3 py-2 text-sm text-editor-muted hover:bg-editor-hover"
        title={t.wordDensity.title}
      >
        <BarChart3 className="h-4 w-4" />
        <span>{t.wordDensity.title}</span>
      </button>

      {isOpen && (
        <div className="fixed right-4 top-20 z-50 w-80 rounded-lg border border-editor-border bg-editor-bg shadow-xl">
          <div className="flex items-center justify-between border-b border-editor-border p-3">
            <h3 className="font-medium">{t.wordDensity.title}</h3>
            <button
              onClick={togglePanel}
              className="rounded p-1 hover:bg-editor-hover"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <div className="mb-4 rounded-lg bg-editor-hover p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{t.wordDensity.sentiment}</span>
                <div className={cn("flex items-center gap-1", SENTIMENT_CLASSES[sentiment.label])}>
                  <SentimentIcon className="h-5 w-5" />
                  <span className="text-sm capitalize">{sentiment.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-editor-border">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      sentiment.score >= 0 ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{
                      width: `${Math.abs(sentiment.score * 100)}%`,
                      marginLeft: sentiment.score < 0 ? "auto" : 0,
                    }}
                  />
                </div>
                <span className="text-xs text-editor-muted">
                  {sentiment.score.toFixed(2)}
                </span>
              </div>
            </div>

            <h4 className="mb-2 text-sm font-medium">{t.wordDensity.topWords}</h4>
            {topWords.length === 0 ? (
              <p className="text-sm text-editor-muted">No words yet...</p>
            ) : (
              <ul className="space-y-2">
                {topWords.map((item) => (
                  <li key={item.word} className="flex items-center gap-2">
                    <span className="w-20 truncate text-sm">{item.word}</span>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-editor-border">
                        <div
                          className="h-full rounded-full bg-editor-accent"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-editor-muted">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
