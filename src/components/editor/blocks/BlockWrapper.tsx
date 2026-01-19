"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import type { Block } from "@/types";
import { cn } from "@/lib";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface BlockWrapperProps {
  block: Block;
  index: number;
  isFocused: boolean;
  children: React.ReactNode;
}

export function BlockWrapper({
  block,
  index,
  isFocused,
  children,
}: BlockWrapperProps) {
  const { t } = useI18n();
  const [isHovered, setIsHovered] = useState(false);
  const setFocusedBlock = useEditorStore((state) => state.setFocusedBlock);
  const addBlock = useEditorStore((state) => state.addBlock);
  const deleteBlock = useEditorStore((state) => state.deleteBlock);
  const duplicateBlock = useEditorStore((state) => state.duplicateBlock);
  const moveBlock = useEditorStore((state) => state.moveBlock);
  const document = useEditorStore((state) => state.document);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const handleFocus = () => {
    setFocusedBlock(block.id);
  };

  const handleAddBlock = () => {
    pushToHistory("Add block");
    addBlock("paragraph", block.id);
  };

  const handleDelete = () => {
    pushToHistory("Delete block");
    deleteBlock(block.id);
  };

  const handleDuplicate = () => {
    pushToHistory("Duplicate block");
    duplicateBlock(block.id);
  };

  const handleMoveUp = () => {
    if (index > 0) {
      pushToHistory("Move block up");
      moveBlock(block.id, index - 1);
    }
  };

  const handleMoveDown = () => {
    if (index < document.blocks.length - 1) {
      pushToHistory("Move block down");
      moveBlock(block.id, index + 1);
    }
  };

  return (
    <div
      className={cn(
        "editor-block group relative",
        isFocused && "focused"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={handleFocus}
    >
      <div
        className={cn(
          "absolute -left-12 top-0 flex items-center gap-1 opacity-0 transition-opacity",
          isHovered && "opacity-100"
        )}
      >
        <button
          onClick={handleAddBlock}
          className="flex h-6 w-6 items-center justify-center rounded text-editor-muted hover:bg-editor-hover hover:text-editor-text"
          title="Add block"
          aria-label="Add block below"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          className="flex h-6 w-6 cursor-grab items-center justify-center rounded text-editor-muted hover:bg-editor-hover hover:text-editor-text"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      <div
        className={cn(
          "absolute -right-28 top-0 flex items-center gap-1 opacity-0 transition-opacity",
          isHovered && "opacity-100"
        )}
      >
        <button
          onClick={handleMoveUp}
          disabled={index === 0}
          className="flex h-6 w-6 items-center justify-center rounded text-editor-muted hover:bg-editor-hover hover:text-editor-text disabled:opacity-30"
          title={t.actions.moveUp}
          aria-label={t.actions.moveUp}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={handleMoveDown}
          disabled={index === document.blocks.length - 1}
          className="flex h-6 w-6 items-center justify-center rounded text-editor-muted hover:bg-editor-hover hover:text-editor-text disabled:opacity-30"
          title={t.actions.moveDown}
          aria-label={t.actions.moveDown}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          onClick={handleDuplicate}
          className="flex h-6 w-6 items-center justify-center rounded text-editor-muted hover:bg-editor-hover hover:text-editor-text"
          title={t.actions.duplicate}
          aria-label={t.actions.duplicate}
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={document.blocks.length <= 1}
          className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 dark:hover:bg-red-900/20"
          title={t.actions.delete}
          aria-label={t.actions.delete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="px-2 py-1">{children}</div>
    </div>
  );
}
