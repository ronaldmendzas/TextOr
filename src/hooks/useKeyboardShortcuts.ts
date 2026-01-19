import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores";

interface KeyboardShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts() {
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const toggleFocusMode = useEditorStore((state) => state.toggleFocusMode);
  const canUndo = useEditorStore((state) => state.canUndo);
  const canRedo = useEditorStore((state) => state.canRedo);

  const shortcuts: KeyboardShortcutConfig[] = [
    {
      key: "z",
      ctrl: true,
      shift: false,
      action: () => {
        if (canUndo()) undo();
      },
      preventDefault: true,
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      action: () => {
        if (canRedo()) redo();
      },
      preventDefault: true,
    },
    {
      key: "y",
      ctrl: true,
      action: () => {
        if (canRedo()) redo();
      },
      preventDefault: true,
    },
    {
      key: "\\",
      ctrl: true,
      action: toggleFocusMode,
      preventDefault: true,
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault) {
            event.preventDefault();
          }
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
