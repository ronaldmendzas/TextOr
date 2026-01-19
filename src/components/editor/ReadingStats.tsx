"use client";

import { memo } from "react";
import { useI18n, useTextAnalysis } from "@/hooks";
import { Clock, Type, BarChart2 } from "lucide-react";

function ReadingStatsInner() {
  const { t } = useI18n();
  const { stats } = useTextAnalysis();

  return (
    <div className="flex items-center gap-4 rounded-lg bg-editor-bg px-4 py-2 text-sm">
      <div className="flex items-center gap-1.5 text-editor-muted" title={t.stats.words}>
        <Type className="h-4 w-4" />
        <span>{stats.wordCount}</span>
      </div>
      <div className="flex items-center gap-1.5 text-editor-muted" title={t.stats.readingTime}>
        <Clock className="h-4 w-4" />
        <span>{stats.readingTime} min</span>
      </div>
      <div className="flex items-center gap-1.5 text-editor-muted" title={t.stats.characters}>
        <BarChart2 className="h-4 w-4" />
        <span>{stats.characterCount}</span>
      </div>
    </div>
  );
}

export const ReadingStats = memo(ReadingStatsInner);
