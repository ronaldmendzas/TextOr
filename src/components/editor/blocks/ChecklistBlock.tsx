"use client";

import { useCallback, useRef, KeyboardEvent } from "react";
import { useEditorStore } from "@/stores";
import type { Block, ListItem } from "@/types";
import { cn, createListItem } from "@/lib";
import { Check, Plus, Trash2, GripVertical } from "lucide-react";

interface ChecklistBlockProps {
  block: Block<"list">;
}

export function ChecklistBlock({ block }: ChecklistBlockProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const handleToggle = useCallback(
    (itemId: string) => {
      pushToHistory("Toggle checklist item");
      const items = block.data.items.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      updateBlock<"list">(block.id, { items });
    },
    [block.id, block.data.items, updateBlock, pushToHistory]
  );

  const handleTextChange = useCallback(
    (itemId: string, text: string) => {
      const items = block.data.items.map((item) =>
        item.id === itemId ? { ...item, content: [{ text }] } : item
      );
      updateBlock<"list">(block.id, { items });
    },
    [block.id, block.data.items, updateBlock]
  );

  const handleAddItem = useCallback(
    (afterId?: string) => {
      pushToHistory("Add checklist item");
      const newItem = createListItem("", false);

      let items: ListItem[];
      if (afterId) {
        const idx = block.data.items.findIndex((i) => i.id === afterId);
        items = [
          ...block.data.items.slice(0, idx + 1),
          newItem,
          ...block.data.items.slice(idx + 1),
        ];
      } else {
        items = [...block.data.items, newItem];
      }

      updateBlock<"list">(block.id, { items });
      setTimeout(() => inputRefs.current.get(newItem.id)?.focus(), 50);
    },
    [block.id, block.data.items, updateBlock, pushToHistory]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (block.data.items.length <= 1) return;
      pushToHistory("Delete checklist item");
      const items = block.data.items.filter((i) => i.id !== itemId);
      updateBlock<"list">(block.id, { items });
    },
    [block.id, block.data.items, updateBlock, pushToHistory]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, itemId: string) => {
      const item = block.data.items.find((i) => i.id === itemId);
      const text = item?.content?.[0]?.text ?? "";

      if (e.key === "Enter") {
        e.preventDefault();
        handleAddItem(itemId);
      }

      if (e.key === "Backspace" && text === "" && block.data.items.length > 1) {
        e.preventDefault();
        const idx = block.data.items.findIndex((i) => i.id === itemId);
        const prevItem = idx > 0 ? block.data.items[idx - 1] : null;
        handleDeleteItem(itemId);
        if (prevItem) {
          setTimeout(() => inputRefs.current.get(prevItem.id)?.focus(), 50);
        }
      }

      if (e.key === "ArrowUp") {
        const idx = block.data.items.findIndex((i) => i.id === itemId);
        const prevItem = idx > 0 ? block.data.items[idx - 1] : null;
        if (prevItem) {
          e.preventDefault();
          inputRefs.current.get(prevItem.id)?.focus();
        }
      }

      if (e.key === "ArrowDown") {
        const idx = block.data.items.findIndex((i) => i.id === itemId);
        const nextItem = idx < block.data.items.length - 1 ? block.data.items[idx + 1] : null;
        if (nextItem) {
          e.preventDefault();
          inputRefs.current.get(nextItem.id)?.focus();
        }
      }
    },
    [block.data.items, handleAddItem, handleDeleteItem]
  );

  const completedCount = block.data.items.filter((i) => i.checked).length;
  const totalCount = block.data.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="checklist-block">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-editor-muted">
          <Check className="h-4 w-4" />
          <span>
            {completedCount}/{totalCount} completed
          </span>
        </div>
        <div className="w-24 h-1.5 bg-editor-hover rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full bg-green-500 transition-all duration-300",
              progress === 0 && "w-0",
              progress > 0 && progress <= 25 && "w-1/4",
              progress > 25 && progress <= 50 && "w-1/2",
              progress > 50 && progress <= 75 && "w-3/4",
              progress > 75 && "w-full"
            )}
          />
        </div>
      </div>

      <div className="space-y-1">
        {block.data.items.map((item) => {
          const text = item.content?.[0]?.text ?? "";
          return (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2 py-1.5",
                "hover:bg-editor-hover transition-colors"
              )}
            >
              <GripVertical className="h-4 w-4 text-editor-muted opacity-0 group-hover:opacity-50 cursor-grab" />

              <button
                onClick={() => handleToggle(item.id)}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded border-2 transition-all",
                  item.checked
                    ? "border-green-500 bg-green-500"
                    : "border-editor-border hover:border-editor-accent"
                )}
              >
                {item.checked && <Check className="h-3 w-3 text-white" />}
              </button>

              <input
                ref={(el) => {
                  if (el) inputRefs.current.set(item.id, el);
                }}
                type="text"
                value={text}
                onChange={(e) => handleTextChange(item.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                placeholder="Task..."
                className={cn(
                  "flex-1 bg-transparent text-sm outline-none",
                  item.checked && "text-editor-muted line-through"
                )}
              />

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                title="Delete item"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => handleAddItem()}
        className={cn(
          "mt-2 flex items-center gap-1.5 text-sm text-editor-muted",
          "hover:text-editor-accent transition-colors"
        )}
      >
        <Plus className="h-4 w-4" />
        <span>Add item</span>
      </button>
    </div>
  );
}
