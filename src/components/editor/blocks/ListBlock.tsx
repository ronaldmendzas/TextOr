"use client";

import { useCallback } from "react";
import { useEditorStore } from "@/stores";
import type { Block, ListItem, ListStyle } from "@/types";
import { cn, createListItem } from "@/lib";
import { Plus, Trash2 } from "lucide-react";

interface ListBlockProps {
  block: Block<"list">;
}

export function ListBlock({ block }: ListBlockProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const pushToHistory = useEditorStore((state) => state.pushToHistory);

  const { style, items } = block.data;

  const handleItemChange = useCallback(
    (itemId: string, text: string) => {
      const newItems = items.map((item) =>
        item.id === itemId
          ? { ...item, content: [{ text }] }
          : item
      );
      updateBlock<"list">(block.id, { items: newItems });
    },
    [block.id, items, updateBlock]
  );

  const handleCheckboxChange = useCallback(
    (itemId: string) => {
      const newItems = items.map((item) =>
        item.id === itemId
          ? { ...item, checked: !item.checked }
          : item
      );
      updateBlock<"list">(block.id, { items: newItems });
    },
    [block.id, items, updateBlock]
  );

  const handleAddItem = useCallback(
    (afterItemId?: string) => {
      pushToHistory("Add list item");
      const newItem = createListItem("", style === "checkbox" ? false : undefined);

      let newItems: ListItem[];
      if (afterItemId) {
        const index = items.findIndex((item) => item.id === afterItemId);
        newItems = [...items];
        newItems.splice(index + 1, 0, newItem);
      } else {
        newItems = [...items, newItem];
      }

      updateBlock<"list">(block.id, { items: newItems });
    },
    [block.id, items, style, updateBlock, pushToHistory]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      if (items.length <= 1) return;
      pushToHistory("Delete list item");
      const newItems = items.filter((item) => item.id !== itemId);
      updateBlock<"list">(block.id, { items: newItems });
    },
    [block.id, items, updateBlock, pushToHistory]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, itemId: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddItem(itemId);
      }
      if (e.key === "Backspace") {
        const item = items.find((i) => i.id === itemId);
        if (item && item.content[0]?.text === "" && items.length > 1) {
          e.preventDefault();
          handleDeleteItem(itemId);
        }
      }
    },
    [items, handleAddItem, handleDeleteItem]
  );

  const handleStyleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      pushToHistory("Change list style");
      const newStyle = e.target.value as ListStyle;
      const newItems = items.map((item) => ({
        ...item,
        checked: newStyle === "checkbox" ? false : undefined,
      }));
      updateBlock<"list">(block.id, { style: newStyle, items: newItems });
    },
    [block.id, items, updateBlock, pushToHistory]
  );

  const renderListMarker = (index: number) => {
    switch (style) {
      case "bullet":
        return <span className="mr-2 text-editor-muted">•</span>;
      case "numbered":
        return <span className="mr-2 text-editor-muted">{index + 1}.</span>;
      case "checkbox":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="my-2">
      <div className="mb-2">
        <select
          value={style}
          onChange={handleStyleChange}
          className="rounded bg-transparent text-xs text-editor-muted focus:outline-none focus:ring-1 focus:ring-editor-accent"
          aria-label="List style"
        >
          <option value="bullet">Bullet</option>
          <option value="numbered">Numbered</option>
          <option value="checkbox">Checkbox</option>
        </select>
      </div>

      <ul className="space-y-1">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="group flex items-center gap-2"
          >
            {style === "checkbox" ? (
              <input
                type="checkbox"
                checked={item.checked ?? false}
                onChange={() => handleCheckboxChange(item.id)}
                className="h-4 w-4 rounded border-editor-border text-editor-accent focus:ring-editor-accent"
                aria-label={`Checkbox for item ${index + 1}`}
              />
            ) : (
              renderListMarker(index)
            )}

            <input
              type="text"
              value={item.content.map((s) => s.text).join("")}
              onChange={(e) => handleItemChange(item.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className={cn(
                "flex-1 bg-transparent outline-none",
                style === "checkbox" && item.checked && "text-editor-muted line-through"
              )}
              placeholder="List item..."
              aria-label={`List item ${index + 1}`}
            />

            <button
              onClick={() => handleDeleteItem(item.id)}
              disabled={items.length <= 1}
              className="opacity-0 group-hover:opacity-50 hover:opacity-100 disabled:hidden"
              title="Delete item"
            >
              <Trash2 className="h-3 w-3 text-red-400" />
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => handleAddItem()}
        className={cn(
          "mt-2 flex items-center gap-1 text-sm text-editor-muted",
          "hover:text-editor-text transition-colors duration-150"
        )}
      >
        <Plus className="h-4 w-4" />
        <span>Add item</span>
      </button>
    </div>
  );
}
