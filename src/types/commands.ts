import type { BlockType } from "./document";

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  keywords: string[];
  blockType: BlockType;
  action?: () => void;
}

export interface DynamicVariable {
  pattern: RegExp;
  name: string;
  description: string;
  resolver: () => string;
}

export interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords: string[];
  shortcodes: string;
}

export interface CalculatorResult {
  expression: string;
  result: number;
  isValid: boolean;
}

export interface CommandPaletteItem {
  id: string;
  type: "command" | "variable" | "emoji" | "calculator";
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
}

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: string;
  description: string;
};
