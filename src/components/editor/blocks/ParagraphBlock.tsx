"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block } from "@/types";
import { resolveDynamicVariables, processInlineCalculation } from "@/lib";

interface ParagraphBlockProps {
  block: Block<"paragraph">;
}

export function ParagraphBlock({ block }: ParagraphBlockProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const openSlashMenu = useEditorStore((state) => state.openSlashMenu);
  const openEmojiPicker = useEditorStore((state) => state.openEmojiPicker);
  const addBlock = useEditorStore((state) => state.addBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);
  const focusedBlockId = useEditorStore((state) => state.editor.focusedBlockId);

  const currentText = block.data.content.map((s) => s.text).join("");

  useEffect(() => {
    if (focusedBlockId === block.id && ref.current && !ref.current.textContent) {
      ref.current.focus();
    }
  }, [focusedBlockId, block.id]);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent ?? "";

      const processedText = resolveDynamicVariables(text);

      if (processedText !== text && ref.current) {
        ref.current.textContent = processedText;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      updateBlock<"paragraph">(block.id, {
        content: [{ text: processedText }],
      });
    },
    [block.id, updateBlock]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const text = ref.current?.textContent ?? "";

      if (e.key === "/") {
        if (text === "" || text.endsWith(" ")) {
          const rect = ref.current?.getBoundingClientRect();
          if (rect) {
            openSlashMenu({ x: rect.left, y: rect.bottom + 4 }, block.id);
          }
        }
      }

      if (e.key === ":") {
        setTimeout(() => {
          const currentText = ref.current?.textContent ?? "";
          if (currentText.match(/:[\w]{2,}$/)) {
            const rect = ref.current?.getBoundingClientRect();
            if (rect) {
              openEmojiPicker({ x: rect.left, y: rect.bottom + 4 }, block.id);
            }
          }
        }, 50);
      }

      if (e.key === " ") {
        if (text.startsWith("=")) {
          const result = processInlineCalculation(text);
          if (result !== null) {
            e.preventDefault();
            const newText = `${text} = ${result}`;
            if (ref.current) {
              ref.current.textContent = newText;
            }
            updateBlock<"paragraph">(block.id, {
              content: [{ text: newText }],
            });
          }
        }
      }

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        pushToHistory("Add paragraph");
        addBlock("paragraph", block.id);
      }
    },
    [block.id, openSlashMenu, openEmojiPicker, updateBlock, addBlock, pushToHistory]
  );

  useEffect(() => {
    if (ref.current && ref.current.textContent !== currentText) {
      ref.current.textContent = currentText;
    }
  }, []);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className="min-h-[1.5em] outline-none"
      data-placeholder={t.editor.placeholder}
      role="textbox"
      aria-multiline="false"
    />
  );
}
