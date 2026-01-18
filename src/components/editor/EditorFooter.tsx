'use client';

import type { Editor } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { Clock, Type, Save, Check } from 'lucide-react';
import { useEditorStore } from '@/store/editor.store';
import { TextAnalyzer } from '@/lib/text-analyzer';

interface EditorFooterProps {
  editor: Editor;
}

export function EditorFooter({ editor }: EditorFooterProps) {
  const { isSaving, lastSaved } = useEditorStore();
  const [stats, setStats] = useState({
    wordCount: 0,
    readingTime: 0,
    characterCount: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const text = editor.getText();
      const analyzer = new TextAnalyzer(text);
      const analysis = analyzer.analyze();

      setStats({
        wordCount: analysis.wordCount,
        readingTime: analysis.readingTime,
        characterCount: analysis.characterCount,
      });
    };

    updateStats();

    editor.on('update', updateStats);

    return () => {
      editor.off('update', updateStats);
    };
  }, [editor]);

  return (
    <div className="border-t border-border bg-muted/50 px-4 py-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" />
            <span>{stats.wordCount} words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{stats.readingTime} min read</span>
          </div>
          <div className="text-xs">
            {stats.characterCount} characters
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving ? (
            <div className="flex items-center gap-1.5 text-blue-600">
              <Save className="w-3.5 h-3.5 animate-pulse" />
              <span>Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-1.5 text-green-600">
              <Check className="w-3.5 h-3.5" />
              <span>Saved {formatLastSaved(lastSaved)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatLastSaved(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}
