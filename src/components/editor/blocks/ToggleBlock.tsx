"use client";

import { useState, useCallback, useRef, KeyboardEvent } from "react";
import { useEditorStore } from "@/stores";
import type { Block } from "@/types";
import { cn } from "@/lib";
import { ChevronRight, ChevronDown } from "lucide-react";

interface ToggleBlockProps {
  block: Block<"callout">;
}

export function ToggleBlock({ block }: ToggleBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const title = block.data.title ?? "";
  const content = block.data.content?.[0]?.text ?? "";

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock<"callout">(block.id, { title: e.target.value });
    },
    [block.id, updateBlock]
  );

  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent ?? "";
      updateBlock<"callout">(block.id, { content: [{ text }] });
    },
    [block.id, updateBlock]
  );

  const handleTitleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => contentRef.current?.focus(), 50);
      }
      if (e.key === "ArrowDown" && isExpanded) {
        e.preventDefault();
        contentRef.current?.focus();
      }
    },
    [isExpanded]
  );

  const handleToggle = useCallback(() => {
    pushToHistory("Toggle collapse");
    setIsExpanded(!isExpanded);
  }, [isExpanded, pushToHistory]);

  return (
    <div
      className={cn(
        "toggle-block rounded-lg border border-editor-border",
        "bg-editor-sidebar transition-all"
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2",
          "hover:bg-editor-hover transition-colors rounded-t-lg",
          !isExpanded && "rounded-b-lg"
        )}
      >
        <button
          onClick={handleToggle}
          className="shrink-0 p-0.5 hover:bg-editor-border rounded"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-editor-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-editor-muted" />
          )}
        </button>

        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="Toggle heading..."
          className={cn(
            "flex-1 bg-transparent font-medium text-editor-text outline-none",
            "placeholder:text-editor-muted"
          )}
        />
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-editor-border px-3 py-3 pl-9">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            data-placeholder="Toggle content..."
            className={cn(
              "min-h-[1.5rem] text-sm text-editor-text outline-none",
              "empty:before:content-[attr(data-placeholder)] empty:before:text-editor-muted"
            )}
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
