"use client";

import { useEffect } from "react";
import { useAutoSave, useKeyboardShortcuts } from "@/hooks";

interface EditorProviderProps {
  children: React.ReactNode;
}

export function EditorProvider({ children }: EditorProviderProps) {
  useAutoSave();
  useKeyboardShortcuts();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return <>{children}</>;
}
