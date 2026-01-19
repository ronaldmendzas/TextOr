export interface EditorSelection {
  blockId: string;
  startOffset: number;
  endOffset: number;
}

export interface EditorCursor {
  blockId: string;
  offset: number;
}

export interface EditorState {
  focusedBlockId: string | null;
  selection: EditorSelection | null;
  cursor: EditorCursor | null;
  isComposing: boolean;
  isDragging: boolean;
}

export interface SlashMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  query: string;
  selectedIndex: number;
  triggerBlockId: string | null;
}

export interface EmojiPickerState {
  isOpen: boolean;
  position: { x: number; y: number };
  query: string;
  triggerBlockId: string | null;
}

export interface FloatingToolbarState {
  isVisible: boolean;
  position: { x: number; y: number };
}

export interface FocusModeState {
  isActive: boolean;
  focusedBlockId: string | null;
}

export interface WritingStats {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
}

export interface WordFrequency {
  word: string;
  count: number;
  percentage: number;
}

export interface SentimentAnalysis {
  score: number;
  comparative: number;
  label: "positive" | "negative" | "neutral";
  positiveWords: string[];
  negativeWords: string[];
}

export interface WordDensityData {
  topWords: WordFrequency[];
  sentiment: SentimentAnalysis;
}

export interface SaveState {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt: number | null;
  errorMessage?: string;
}

export interface HistoryEntry {
  documentSnapshot: string;
  timestamp: number;
  description: string;
}

export interface UndoRedoState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistorySize: number;
}
