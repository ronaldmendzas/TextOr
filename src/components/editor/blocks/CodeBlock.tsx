"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block } from "@/types";
import { cn } from "@/lib";
import { Play, Loader2 } from "lucide-react";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="h-40 animate-pulse bg-editor-hover" /> }
);

interface CodeBlockProps {
  block: Block<"code">;
}

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "json",
  "markdown",
  "sql",
  "shell",
];

export function CodeBlock({ block }: CodeBlockProps) {
  const { t } = useI18n();
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);
  const [isRunning, setIsRunning] = useState(false);

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      updateBlock<"code">(block.id, {
        code: value ?? "",
      });
    },
    [block.id, updateBlock]
  );

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      pushToHistory("Change code language");
      updateBlock<"code">(block.id, {
        language: e.target.value,
      });
    },
    [block.id, updateBlock, pushToHistory]
  );

  const handleRunCode = useCallback(async () => {
    if (block.data.language !== "javascript") {
      updateBlock<"code">(block.id, {
        output: `Execution only supported for JavaScript`,
      });
      return;
    }

    setIsRunning(true);
    updateBlock<"code">(block.id, {
      isRunning: true,
      output: undefined,
    });

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map((arg) => String(arg)).join(" "));
      };

      let result: unknown;
      try {
        result = new Function(block.data.code)();
      } catch (error) {
        if (error instanceof Error) {
          logs.push(`Error: ${error.message}`);
        }
      }

      console.log = originalLog;

      const output =
        logs.length > 0
          ? logs.join("\n")
          : result !== undefined
          ? String(result)
          : "No output";

      updateBlock<"code">(block.id, {
        output,
        isRunning: false,
      });
    } catch (error) {
      updateBlock<"code">(block.id, {
        output: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        isRunning: false,
      });
    } finally {
      setIsRunning(false);
    }
  }, [block.id, block.data.code, block.data.language, updateBlock]);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <select
          value={block.data.language}
          onChange={handleLanguageChange}
          className={cn(
            "rounded border-none bg-transparent text-sm text-editor-muted",
            "focus:outline-none focus:ring-1 focus:ring-editor-accent"
          )}
          aria-label={t.blocks.code.language}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className={cn(
            "flex items-center gap-1 rounded-md px-3 py-1 text-sm",
            "bg-green-500 text-white hover:bg-green-600",
            "disabled:opacity-50",
            "transition-colors duration-150"
          )}
          aria-label={isRunning ? t.blocks.code.running : t.blocks.code.run}
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t.blocks.code.running}</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>{t.blocks.code.run}</span>
            </>
          )}
        </button>
      </div>

      <div className="h-40">
        <MonacoEditor
          height="100%"
          language={block.data.language}
          value={block.data.code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>

      {block.data.output && (
        <div className="code-block-output">
          <div className="mb-1 text-xs text-gray-400">
            {t.blocks.code.output}:
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {block.data.output}
          </pre>
        </div>
      )}
    </div>
  );
}
