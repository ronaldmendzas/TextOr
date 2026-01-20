"use client";

import { useEditorStore } from "@/stores";
import { useEditorShortcuts } from "@/hooks";
import { BlockRenderer } from "./BlockRenderer";
import { SlashMenu } from "./SlashMenu";
import { EmojiPicker } from "./EmojiPicker";
import { AutocorrectPanel } from "./AutocorrectPanel";
import { FindReplace } from "./FindReplace";
import { AIAssistantProvider, useAI } from "./AIAssistantProvider";
import { cn } from "@/lib";

function EditorContent() {
  const document = useEditorStore((state) => state.document);
  const focusMode = useEditorStore((state) => state.focusMode);
  const addBlock = useEditorStore((state) => state.addBlock);
  const updateBlock = useEditorStore((state) => state.updateBlock);

  useEditorShortcuts();

  const {
    autocorrectResult,
    showCorrections,
    applyCorrections,
    dismissCorrections,
  } = useAI();

  const handleEditorClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const lastBlock = document.blocks[document.blocks.length - 1];
      if (lastBlock && lastBlock.type !== "paragraph") {
        addBlock("paragraph");
      }
    }
  };

  const handleApplyCorrections = () => {
    const correctedText = applyCorrections();
    if (correctedText) {
      const focusedBlock = document.blocks.find(
        (b) => b.type === "paragraph"
      );
      if (focusedBlock) {
        updateBlock<"paragraph">(focusedBlock.id, {
          content: [{ text: correctedText }],
        });
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
      <FindReplace />
      <AutocorrectPanel
        result={autocorrectResult}
        isVisible={showCorrections}
        onApply={handleApplyCorrections}
        onDismiss={dismissCorrections}
      />
    </div>
  );
}

export function Editor() {
  return (
    <AIAssistantProvider>
      <EditorContent />
    </AIAssistantProvider>
  );
}
