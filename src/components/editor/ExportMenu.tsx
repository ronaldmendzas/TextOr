"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import {
  exportToMarkdown,
  exportToJSON,
  exportToHTML,
  exportToPDF,
} from "@/lib";
import { Download, ChevronDown, FileText, Code, FileJson, FileCode } from "lucide-react";
import { cn } from "@/lib";

type ExportFormat = "pdf" | "markdown" | "json" | "html";

export function ExportMenu() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = useEditorStore((state) => state.document.title);
  const blocks = useEditorStore((state) => state.document.blocks);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setIsExporting(true);
      setIsOpen(false);

      try {
        const filename = title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "document";

        switch (format) {
          case "markdown": {
            const content = exportToMarkdown(blocks);
            downloadFile(content, `${filename}.md`, "text/markdown");
            break;
          }
          case "json": {
            const content = exportToJSON(blocks, title);
            downloadFile(content, `${filename}.json`, "application/json");
            break;
          }
          case "html": {
            const content = exportToHTML(blocks, title);
            downloadFile(content, `${filename}.html`, "text/html");
            break;
          }
          case "pdf": {
            await exportToPDF(blocks, title);
            break;
          }
        }
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        setIsExporting(false);
      }
    },
    [blocks, title]
  );

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={toggleMenu}
        disabled={isExporting}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm",
          "bg-editor-accent text-white hover:bg-editor-accent/90",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <Download className="h-4 w-4" />
        <span>{isExporting ? "Exporting..." : t.export.title}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-editor-border bg-editor-bg py-1 shadow-xl">
          <button
            onClick={() => handleExport("pdf")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-editor-hover"
          >
            <FileText className="h-4 w-4 text-red-500" />
            <span>{t.export.pdf}</span>
          </button>
          <button
            onClick={() => handleExport("markdown")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-editor-hover"
          >
            <Code className="h-4 w-4 text-blue-500" />
            <span>{t.export.markdown}</span>
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-editor-hover"
          >
            <FileJson className="h-4 w-4 text-yellow-500" />
            <span>{t.export.json}</span>
          </button>
          <button
            onClick={() => handleExport("html")}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-editor-hover"
          >
            <FileCode className="h-4 w-4 text-orange-500" />
            <span>{t.export.html}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
