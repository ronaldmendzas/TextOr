"use client";

import { EditorProvider } from "@/components/editor/EditorProvider";
import { Editor } from "@/components/editor/Editor";
import { Toolbar } from "@/components/editor/Toolbar";
import { ReadingStats } from "@/components/editor/ReadingStats";
import { WordDensityPanel } from "@/components/editor/WordDensityPanel";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import { ExportMenu } from "@/components/editor/ExportMenu";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useI18n } from "@/hooks/useI18n";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <EditorProvider>
      <div className="min-h-screen bg-editor-bg">
        <header className="sticky top-0 z-30 border-b border-editor-border bg-editor-bg/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-editor-text">TextOr</h1>
              <span className="rounded-full bg-editor-accent/10 px-2 py-0.5 text-xs text-editor-accent">
                {t.editor.beta}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ExportMenu />
            </div>
          </div>
          <Toolbar />
        </header>

        <main className="editor-container">
          <Editor />
        </main>

        <SaveIndicator />
        <ReadingStats />
        <WordDensityPanel />
      </div>
    </EditorProvider>
  );
}
