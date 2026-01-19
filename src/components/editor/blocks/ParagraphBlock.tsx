"use client";

import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block } from "@/types";
import { resolveDynamicVariables, processInlineCalculation, autocorrectText, replaceEmojiShortcuts } from "@/lib";

const PUNCTUATION_TRIGGERS = [".", ",", "!", "?", ";", ":"];
const MIN_TEXT_LENGTH = 8;

interface ParagraphBlockProps {
  block: Block<"paragraph">;
}

export function ParagraphBlock({ block }: ParagraphBlockProps) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const isCorrectingRef = useRef(false);
  const lastCorrectedTextRef = useRef("");
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const openSlashMenu = useEditorStore((state) => state.openSlashMenu);
  const openEmojiPicker = useEditorStore((state) => state.openEmojiPicker);
  const updateEmojiPickerQuery = useEditorStore((state) => state.updateEmojiPickerQuery);
  const emojiPickerOpen = useEditorStore((state) => state.emojiPicker.isOpen);
  const addBlock = useEditorStore((state) => state.addBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);
  const focusedBlockId = useEditorStore((state) => state.editor.focusedBlockId);

  const currentText = block.data.content.map((s) => s.text).join("");

  const performAutocorrect = useCallback(
    async (text: string) => {
      if (isCorrectingRef.current) return;
      if (text.length < MIN_TEXT_LENGTH) return;
      if (text === lastCorrectedTextRef.current) return;

      isCorrectingRef.current = true;

      try {
        const result = await autocorrectText(text);

        if (result.corrections.length > 0 && ref.current) {
          lastCorrectedTextRef.current = result.correctedText;

          const selection = window.getSelection();
          const cursorAtEnd = selection?.focusOffset === ref.current.textContent?.length;

          ref.current.textContent = result.correctedText;

          updateBlock<"paragraph">(block.id, {
            content: [{ text: result.correctedText }],
          });

          if (cursorAtEnd) {
            const range = document.createRange();
            range.selectNodeContents(ref.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      } finally {
        isCorrectingRef.current = false;
      }
    },
    [block.id, updateBlock]
  );

  useEffect(() => {
    if (focusedBlockId === block.id && ref.current && !ref.current.textContent) {
      ref.current.focus();
    }
  }, [focusedBlockId, block.id]);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const text = e.currentTarget.textContent ?? "";

      let processedText = resolveDynamicVariables(text);
      
      const emojiProcessed = replaceEmojiShortcuts(processedText);
      if (emojiProcessed !== processedText) {
        processedText = emojiProcessed;
        if (ref.current) {
          ref.current.textContent = processedText;
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(ref.current);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }

      if (processedText !== text && ref.current && ref.current.textContent !== processedText) {
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

      if (emojiPickerOpen) {
        const colonMatch = processedText.match(/:(\w*)$/);
        if (colonMatch && colonMatch[1] !== undefined) {
          updateEmojiPickerQuery(colonMatch[1]);
        }
      }

      const lastChar = processedText.slice(-1);
      if (PUNCTUATION_TRIGGERS.includes(lastChar)) {
        performAutocorrect(processedText);
      }
    },
    [block.id, updateBlock, performAutocorrect, emojiPickerOpen, updateEmojiPickerQuery]
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
