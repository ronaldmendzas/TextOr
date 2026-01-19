"use client";

import { useRef, useCallback } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block, CalloutType } from "@/types";
import { cn } from "@/lib";
import { Info, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react";

interface CalloutBlockProps {
  block: Block<"callout">;
}

const CALLOUT_ICONS: Record<CalloutType, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  tip: Lightbulb,
  danger: AlertOctagon,
};

const CALLOUT_CLASSES: Record<CalloutType, string> = {
  info: "callout-info",
  warning: "callout-warning",
  tip: "callout-tip",
  danger: "callout-danger",
};

export function CalloutBlock({ block }: CalloutBlockProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const currentText = block.data.content.map((s) => s.text).join("");
  const Icon = CALLOUT_ICONS[block.data.type];

  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent ?? "";
      updateBlock<"callout">(block.id, {
        content: [{ text }],
      });
    },
    [block.id, updateBlock]
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      pushToHistory("Change callout type");
      updateBlock<"callout">(block.id, {
        type: e.target.value as CalloutType,
      });
    },
    [block.id, updateBlock, pushToHistory]
  );

  const handleTitleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      updateBlock<"callout">(block.id, {
        title: e.currentTarget.value,
      });
    },
    [block.id, updateBlock]
  );

  return (
    <div className={cn("callout", CALLOUT_CLASSES[block.data.type])}>
      <div className="mb-2 flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <select
          value={block.data.type}
          onChange={handleTypeChange}
          className="rounded bg-transparent text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-current"
          aria-label="Callout type"
        >
          <option value="info">{t.blocks.callout.info}</option>
          <option value="warning">{t.blocks.callout.warning}</option>
          <option value="tip">{t.blocks.callout.tip}</option>
          <option value="danger">{t.blocks.callout.danger}</option>
        </select>
        <input
          type="text"
          value={block.data.title ?? ""}
          onChange={handleTitleChange}
          placeholder="Title (optional)"
          className="flex-1 bg-transparent text-sm font-semibold placeholder:opacity-50 focus:outline-none"
          aria-label="Callout title"
        />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        className="ml-8 min-h-[1.5em] outline-none"
        role="textbox"
        aria-label="Callout content"
      >
        {currentText || (
          <span className="pointer-events-none opacity-50">
            Type your message here...
          </span>
        )}
      </div>
    </div>
  );
}
