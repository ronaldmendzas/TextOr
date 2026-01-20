import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores";

export function useEditorShortcuts() {
  const document = useEditorStore((state) => state.document);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const moveBlock = useEditorStore((state) => state.moveBlock);
  const getBlockIndex = useEditorStore((state) => state.getBlockIndex);
  const editor = useEditorStore((state) => state.editor);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const selectNextOccurrence = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString();
    if (!selectedText.trim()) return;

    const focusedBlockId = editor.focusedBlockId;
    if (!focusedBlockId) return;

    const blockEl = window.document.querySelector(`[data-block-id="${focusedBlockId}"]`);
    if (!blockEl) return;

    const fullText = blockEl.textContent ?? "";
    const currentPos = fullText.indexOf(selectedText);
    const nextPos = fullText.indexOf(selectedText, currentPos + selectedText.length);

    if (nextPos === -1) return;

    const walker = window.document.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
    let charCount = 0;
    let node;

    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const nodeLength = textNode.length;

      if (charCount + nodeLength > nextPos && charCount <= nextPos) {
        const startOffset = nextPos - charCount;
        const endOffset = Math.min(startOffset + selectedText.length, nodeLength);

        const range = window.document.createRange();
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);

        selection.removeAllRanges();
        selection.addRange(range);
        break;
      }
      charCount += nodeLength;
    }
  }, [editor.focusedBlockId]);

  const duplicateLine = useCallback(() => {
    const focusedBlockId = editor.focusedBlockId;
    if (!focusedBlockId) return;

    pushToHistory("Duplicate block");
    duplicateBlock(focusedBlockId);
  }, [editor.focusedBlockId, duplicateBlock, pushToHistory]);

  const moveLine = useCallback(
    (direction: "up" | "down") => {
      const focusedBlockId = editor.focusedBlockId;
      if (!focusedBlockId) return;

      const currentIndex = getBlockIndex(focusedBlockId);
      if (currentIndex === -1) return;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

      if (targetIndex < 0 || targetIndex >= document.blocks.length) return;

      pushToHistory(`Move block ${direction}`);
      moveBlock(focusedBlockId, targetIndex);
    },
    [editor.focusedBlockId, document.blocks.length, getBlockIndex, moveBlock, pushToHistory]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;

      if (isCtrl && e.key === "d" && !isShift) {
        e.preventDefault();
        selectNextOccurrence();
        return;
      }

      if (isCtrl && isShift && e.key === "D") {
        e.preventDefault();
        duplicateLine();
        return;
      }

      if (isAlt && e.key === "ArrowUp") {
        e.preventDefault();
        moveLine("up");
        return;
      }

      if (isAlt && e.key === "ArrowDown") {
        e.preventDefault();
        moveLine("down");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectNextOccurrence, duplicateLine, moveLine]);
}
