"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useEditorStore } from "@/stores";
import { cn } from "@/lib";

interface EmojiData {
  emoji: string;
  name: string;
  keywords: string[];
}

const COMMON_EMOJIS: EmojiData[] = [
  { emoji: "😀", name: "grinning face", keywords: ["happy", "smile", "feliz"] },
  { emoji: "😂", name: "face with tears of joy", keywords: ["laugh", "funny", "lol", "risa"] },
  { emoji: "😍", name: "smiling face with heart-eyes", keywords: ["love", "heart", "amor"] },
  { emoji: "🤔", name: "thinking face", keywords: ["think", "hmm", "pensando"] },
  { emoji: "👍", name: "thumbs up", keywords: ["ok", "good", "yes", "bien"] },
  { emoji: "👎", name: "thumbs down", keywords: ["bad", "no", "mal"] },
  { emoji: "❤️", name: "red heart", keywords: ["love", "heart", "corazón", "amor"] },
  { emoji: "🔥", name: "fire", keywords: ["hot", "lit", "fuego"] },
  { emoji: "✨", name: "sparkles", keywords: ["magic", "stars", "brillos"] },
  { emoji: "🎉", name: "party popper", keywords: ["party", "celebrate", "fiesta"] },
  { emoji: "💡", name: "light bulb", keywords: ["idea", "think", "bombilla"] },
  { emoji: "⚠️", name: "warning", keywords: ["warning", "alert", "advertencia"] },
  { emoji: "✅", name: "check mark", keywords: ["done", "complete", "check", "listo"] },
  { emoji: "❌", name: "cross mark", keywords: ["no", "wrong", "error", "cruz"] },
  { emoji: "📝", name: "memo", keywords: ["note", "write", "nota", "escribir"] },
  { emoji: "📎", name: "paperclip", keywords: ["attach", "clip", "adjunto"] },
  { emoji: "🔗", name: "link", keywords: ["link", "url", "enlace"] },
  { emoji: "📌", name: "pushpin", keywords: ["pin", "important", "chincheta"] },
  { emoji: "🚀", name: "rocket", keywords: ["fast", "launch", "cohete"] },
  { emoji: "💻", name: "laptop", keywords: ["computer", "code", "computadora"] },
  { emoji: "🐶", name: "dog face", keywords: ["dog", "puppy", "perro"] },
  { emoji: "🐱", name: "cat face", keywords: ["cat", "kitty", "gato"] },
  { emoji: "🌟", name: "glowing star", keywords: ["star", "shine", "estrella"] },
  { emoji: "🌈", name: "rainbow", keywords: ["rainbow", "colors", "arcoíris"] },
  { emoji: "☀️", name: "sun", keywords: ["sun", "sunny", "sol"] },
  { emoji: "🌙", name: "moon", keywords: ["moon", "night", "luna"] },
  { emoji: "⭐", name: "star", keywords: ["star", "favorite", "estrella"] },
  { emoji: "💪", name: "flexed biceps", keywords: ["strong", "power", "fuerza"] },
  { emoji: "🙏", name: "folded hands", keywords: ["please", "thanks", "pray", "gracias"] },
  { emoji: "👋", name: "waving hand", keywords: ["wave", "hello", "bye", "hola", "adiós"] },
];

export function EmojiPicker() {
  const emojiPicker = useEditorStore((state) => state.emojiPicker);
  const closeEmojiPicker = useEditorStore((state) => state.closeEmojiPicker);
  const updateBlock = useEditorStore((state) => state.updateBlock);
  const getBlockById = useEditorStore((state) => state.getBlockById);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredEmojis = useMemo(() => {
    if (!emojiPicker.query || emojiPicker.query.length < 2) {
      return COMMON_EMOJIS;
    }
    const query = emojiPicker.query.toLowerCase();
    return COMMON_EMOJIS.filter(
      (e) =>
        e.name.includes(query) || e.keywords.some((kw) => kw.includes(query))
    );
  }, [emojiPicker.query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [emojiPicker.query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!emojiPicker.isOpen) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredEmojis.length);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? filteredEmojis.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 6, filteredEmojis.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 6, 0));
          break;
        case "Enter":
          e.preventDefault();
          const selected = filteredEmojis[selectedIndex];
          if (selected) {
            handleEmojiSelect(selected.emoji);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeEmojiPicker();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emojiPicker.isOpen, filteredEmojis, selectedIndex, closeEmojiPicker]);

  const handleEmojiSelect = (emoji: string) => {
    if (emojiPicker.triggerBlockId) {
      const block = getBlockById(emojiPicker.triggerBlockId);
      if (block && "content" in block.data) {
        const currentContent = block.data.content as Array<{ text: string }>;
        const newText =
          currentContent
            .map((s) => s.text)
            .join("")
            .replace(/:[\w]*$/, "") + emoji;
        updateBlock(block.id, {
          content: [{ text: newText }],
        });
      }
    }
    closeEmojiPicker();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        closeEmojiPicker();
      }
    };

    if (emojiPicker.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPicker.isOpen, closeEmojiPicker]);

  if (!emojiPicker.isOpen) return null;

  return createPortal(
    <div
      ref={pickerRef}
      className="emoji-picker"
      style={{
        top: emojiPicker.position.y,
        left: emojiPicker.position.x,
        maxWidth: "280px",
      }}
    >
      <div className="grid grid-cols-6 gap-1">
        {filteredEmojis.map((emojiData, index) => (
          <button
            key={emojiData.emoji}
            onClick={() => handleEmojiSelect(emojiData.emoji)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-lg",
              "hover:bg-editor-hover",
              "transition-colors duration-150",
              index === selectedIndex && "bg-editor-accent/20 ring-2 ring-editor-accent"
            )}
            title={emojiData.name}
          >
            {emojiData.emoji}
          </button>
        ))}
      </div>
      {filteredEmojis.length === 0 && (
        <div className="p-4 text-center text-sm text-editor-muted">
          No emojis found
        </div>
      )}
    </div>,
    document.body
  );
}
