import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores";

const AUTO_SAVE_DELAY = 5000;

export function useAutoSave() {
  const document = useEditorStore((state) => state.document);
  const setSaveState = useEditorStore((state) => state.setSaveState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  const saveDocument = useCallback(async () => {
    const currentState = JSON.stringify(document);

    if (currentState === lastSavedRef.current) {
      return;
    }

    setSaveState("saving");

    try {
      localStorage.setItem("textor-document-backup", currentState);

      await new Promise((resolve) => setTimeout(resolve, 500));

      lastSavedRef.current = currentState;
      setSaveState("saved");
    } catch (error) {
      console.error("Failed to save document:", error);
      setSaveState("error");
    }
  }, [document, setSaveState]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(saveDocument, AUTO_SAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [document, saveDocument]);

  return { saveDocument };
}
