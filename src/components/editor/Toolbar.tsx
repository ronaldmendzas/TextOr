"use client";

import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import { Button } from "@/components/ui";
import { cn } from "@/lib";
import { autocorrectText } from "@/lib/ai-service";
import { useState } from "react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Focus,
  BarChart3,
  Sparkles,
  Loader2,
} from "lucide-react";

export function Toolbar() {
  const { t } = useI18n();
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const document = useEditorStore((state) => state.document);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);
  const toggleFocusMode = useEditorStore((state) => state.toggleFocusMode);
  const focusMode = useEditorStore((state) => state.focusMode);
  const toggleWordDensityPanel = useEditorStore(
    (state) => state.toggleWordDensityPanel
  );
  const wordDensityPanelOpen = useEditorStore(
    (state) => state.wordDensityPanelOpen
  );

  const handleAIAutocorrect = async () => {
    setIsAIProcessing(true);
    try {
      for (const block of document.blocks) {
        if (block.type === "paragraph") {
          const paragraphBlock = block as { id: string; type: "paragraph"; data: { content: { text: string }[] } };
          const text = paragraphBlock.data.content.map((s) => s.text).join("");
          if (text.length > 5) {
            const result = await autocorrectText(text);
            if (result.corrections.length > 0) {
              updateBlock<"paragraph">(block.id, {
                content: [{ text: result.correctedText }],
              });
            }
          }
        }
      }
    } finally {
      setIsAIProcessing(false);
    }
  };

  const toolbarButtons = [
    {
      icon: Undo2,
      label: t.toolbar.undo,
      action: undo,
      disabled: !canUndo(),
    },
    {
      icon: Redo2,
      label: t.toolbar.redo,
      action: redo,
      disabled: !canRedo(),
    },
    { type: "separator" as const },
    { icon: Bold, label: t.toolbar.bold, action: () => {}, shortcut: "Ctrl+B" },
    {
      icon: Italic,
      label: t.toolbar.italic,
      action: () => {},
      shortcut: "Ctrl+I",
    },
    {
      icon: Underline,
      label: t.toolbar.underline,
      action: () => {},
      shortcut: "Ctrl+U",
    },
    {
      icon: Strikethrough,
      label: t.toolbar.strikethrough,
      action: () => {},
    },
    { type: "separator" as const },
    { icon: Code, label: t.toolbar.code, action: () => {} },
    { icon: Link, label: t.toolbar.link, action: () => {} },
    { type: "separator" as const },
    {
      icon: Focus,
      label: t.toolbar.focusMode,
      action: toggleFocusMode,
      active: focusMode.isActive,
    },
    {
      icon: BarChart3,
      label: t.toolbar.wordDensity,
      action: toggleWordDensityPanel,
      active: wordDensityPanelOpen,
    },
    { type: "separator" as const },
    {
      icon: isAIProcessing ? Loader2 : Sparkles,
      label: t.ai?.autocorrecting || "AI Autocorrect",
      action: handleAIAutocorrect,
      disabled: isAIProcessing,
      className: isAIProcessing ? "animate-spin" : "",
    },
  ];

  return (
    <div className="border-b border-editor-border bg-editor-bg px-4 py-2">
      <div className="mx-auto flex max-w-6xl items-center gap-1">
        {toolbarButtons.map((item, index) => {
          if ("type" in item && item.type === "separator") {
            return (
              <div
                key={`sep-${index}`}
                className="mx-1 h-6 w-px bg-editor-border"
              />
            );
          }

          const Icon = item.icon;
          return (
            <Button
              key={item.label}
              variant="ghost"
              size="icon"
              onClick={item.action}
              disabled={"disabled" in item ? item.disabled : false}
              className={cn(
                "toolbar-button",
                "active" in item && item.active && "active"
              )}
              title={
                "shortcut" in item
                  ? `${item.label} (${item.shortcut})`
                  : item.label
              }
              aria-label={item.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}
