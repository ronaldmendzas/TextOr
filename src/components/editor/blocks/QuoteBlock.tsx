"use client";

import { useRef, useCallback } from "react";
import { useEditorStore } from "@/stores";
import type { Block } from "@/types";
import { Quote } from "lucide-react";

interface QuoteBlockProps {
  block: Block<"quote">;
}

export function QuoteBlock({ block }: QuoteBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const currentText = block.data.content.map((s) => s.text).join("");

  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent ?? "";
      updateBlock<"quote">(block.id, {
        content: [{ text }],
      });
    },
    [block.id, updateBlock]
  );

  const handleAuthorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock<"quote">(block.id, {
        author: e.target.value,
      });
    },
    [block.id, updateBlock]
  );

  return (
    <blockquote className="my-4 border-l-4 border-editor-accent pl-4">
      <div className="flex gap-2">
        <Quote className="mt-1 h-5 w-5 flex-shrink-0 text-editor-muted" />
        <div className="flex-1">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            className="min-h-[1.5em] text-lg italic outline-none"
            role="textbox"
            aria-label="Quote content"
          >
            {currentText || (
              <span className="pointer-events-none not-italic text-editor-muted">
                Type your quote here...
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-editor-muted">
            <span>—</span>
            <input
              ref={authorRef}
              type="text"
              value={block.data.author ?? ""}
              onChange={handleAuthorChange}
              placeholder="Author (optional)"
              className="bg-transparent outline-none placeholder:text-editor-muted/50"
              aria-label="Quote author"
            />
          </div>
        </div>
      </div>
    </blockquote>
  );
}
