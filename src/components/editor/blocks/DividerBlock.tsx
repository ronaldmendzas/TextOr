"use client";

import type { Block } from "@/types";

interface DividerBlockProps {
  block: Block<"divider">;
}

export function DividerBlock(_props: DividerBlockProps) {
  return (
    <div className="py-4" role="separator" aria-orientation="horizontal">
      <hr className="border-editor-border" />
    </div>
  );
}
