"use client";

import { useRef, useCallback, createElement } from "react";
import { useEditorStore } from "@/stores";
import type { Block, HeadingLevel } from "@/types";
import { cn } from "@/lib";

interface HeadingBlockProps {
  block: Block<"heading">;
}

export function HeadingBlock({ block }: HeadingBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const addBlock = useEditorStore((state) => state.addBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const currentText = block.data.content.map((s) => s.text).join("");

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent ?? "";
      updateBlock<"heading">(block.id, {
        content: [{ text }],
      });
    },
    [block.id, updateBlock]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        pushToHistory("Add paragraph after heading");
        addBlock("paragraph", block.id);
      }
    },
    [block.id, addBlock, pushToHistory]
  );

  const headingClasses: Record<HeadingLevel, string> = {
    1: "text-4xl font-bold",
    2: "text-3xl font-bold",
    3: "text-2xl font-semibold",
    4: "text-xl font-semibold",
    5: "text-lg font-medium",
    6: "text-base font-medium",
  };

  const headingTag = `h${block.data.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  return createElement(
    headingTag,
    {
      className: cn(headingClasses[block.data.level], "outline-none"),
    },
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className="min-h-[1em]"
      data-placeholder={`Heading ${block.data.level}`}
      role="textbox"
      aria-label={`Heading level ${block.data.level}`}
    >
      {currentText || (
        <span className="pointer-events-none text-editor-muted">
          Heading {block.data.level}
        </span>
      )}
    </div>
  );
}
