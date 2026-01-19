"use client";

import { useEditorStore } from "@/stores";
import { BlockRenderer } from "./BlockRenderer";
import { SlashMenu } from "./SlashMenu";
import { EmojiPicker } from "./EmojiPicker";
import { cn } from "@/lib";

export function Editor() {
  const document = useEditorStore((state) => state.document);
  const focusMode = useEditorStore((state) => state.focusMode);
  const addBlock = useEditorStore((state) => state.addBlock);

  const handleEditorClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const lastBlock = document.blocks[document.blocks.length - 1];
      if (lastBlock && lastBlock.type !== "paragraph") {
        addBlock("paragraph");
      }
    }
  };

  return (
    <div
      className={cn(
        "relative min-h-[70vh] pb-32",
        focusMode.isActive && "focus-mode-active"
      )}
      onClick={handleEditorClick}
    >
      {focusMode.isActive && <div className="focus-mode-overlay" />}

      <div className="space-y-1">
        {document.blocks.map((block, index) => (
          <BlockRenderer
            key={block.id}
            block={block}
            index={index}
            isFocused={
              focusMode.isActive
                ? focusMode.focusedBlockId === block.id
                : false
            }
          />
        ))}
      </div>

      <SlashMenu />
      <EmojiPicker />
    </div>
  );
}
