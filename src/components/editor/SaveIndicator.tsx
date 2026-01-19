"use client";

import { useEditorStore } from "@/stores";
import { useI18n } from "@/hooks";
import { Cloud, CloudOff } from "lucide-react";

export function SaveIndicator() {
  const { t } = useI18n();
  const saveStatus = useEditorStore((state) => state.saveState.status);
  const isSaved = saveStatus === "saved" || saveStatus === "idle";

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {isSaved ? (
        <>
          <Cloud className="h-4 w-4 text-green-500" />
          <span className="text-green-500">{t.save.saved}</span>
        </>
      ) : (
        <>
          <CloudOff className="h-4 w-4 text-editor-muted" />
          <span className="text-editor-muted">{t.save.saving}</span>
        </>
      )}
    </div>
  );
}
