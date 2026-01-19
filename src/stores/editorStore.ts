import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import type {
  Document,
  Block,
  BlockType,
  BlockDataMap,
  EditorState,
  SlashMenuState,
  EmojiPickerState,
  FloatingToolbarState,
  FocusModeState,
  SaveState,
  HistoryEntry,
  UndoRedoState,
} from "@/types";
import {
  createDocument,
  createParagraphBlock,
  createHeadingBlock,
  createCodeBlock,
  createTableBlock,
  createCalloutBlock,
  createDividerBlock,
  createQuoteBlock,
  createListBlock,
  createTimestamp,
} from "@/lib";

interface EditorStore {
  document: Document;
  editor: EditorState;
  slashMenu: SlashMenuState;
  emojiPicker: EmojiPickerState;
  floatingToolbar: FloatingToolbarState;
  focusMode: FocusModeState;
  saveState: SaveState;
  history: UndoRedoState;
  wordDensityPanelOpen: boolean;

  initializeDocument: (doc?: Document) => void;
  updateDocumentTitle: (title: string) => void;

  addBlock: (blockType: BlockType, afterBlockId?: string) => string;
  updateBlock: <T extends BlockType>(
    blockId: string,
    data: Partial<BlockDataMap[T]>
  ) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, targetIndex: number) => void;
  duplicateBlock: (blockId: string) => void;

  setFocusedBlock: (blockId: string | null) => void;
  setSelection: (selection: EditorState["selection"]) => void;
  setCursor: (cursor: EditorState["cursor"]) => void;

  openSlashMenu: (
    position: { x: number; y: number },
    blockId: string
  ) => void;
  closeSlashMenu: () => void;
  updateSlashMenuQuery: (query: string) => void;
  setSlashMenuSelectedIndex: (index: number) => void;

  openEmojiPicker: (
    position: { x: number; y: number },
    blockId: string
  ) => void;
  closeEmojiPicker: () => void;
  updateEmojiPickerQuery: (query: string) => void;

  showFloatingToolbar: (position: { x: number; y: number }) => void;
  hideFloatingToolbar: () => void;

  toggleFocusMode: () => void;
  setFocusModeBlock: (blockId: string | null) => void;

  toggleWordDensityPanel: () => void;

  setSaveState: (state: SaveState["status"]) => void;

  pushToHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  getBlockById: (blockId: string) => Block | undefined;
  getBlockIndex: (blockId: string) => number;
}

const MAX_HISTORY_SIZE = 50;

const createDefaultDocument = (): Document => createDocument("Untitled Document");

const createDefaultEditorState = (): EditorState => ({
  focusedBlockId: null,
  selection: null,
  cursor: null,
  isComposing: false,
  isDragging: false,
});

const createDefaultSlashMenuState = (): SlashMenuState => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  query: "",
  selectedIndex: 0,
  triggerBlockId: null,
});

const createDefaultEmojiPickerState = (): EmojiPickerState => ({
  isOpen: false,
  position: { x: 0, y: 0 },
  query: "",
  triggerBlockId: null,
});

const createDefaultFloatingToolbarState = (): FloatingToolbarState => ({
  isVisible: false,
  position: { x: 0, y: 0 },
});

const createDefaultFocusModeState = (): FocusModeState => ({
  isActive: false,
  focusedBlockId: null,
});

const createDefaultSaveState = (): SaveState => ({
  status: "idle",
  lastSavedAt: null,
});

const createDefaultHistoryState = (): UndoRedoState => ({
  past: [],
  future: [],
  maxHistorySize: MAX_HISTORY_SIZE,
});

export const useEditorStore = create<EditorStore>()(
  persist(
    immer((set, get) => ({
      document: createDefaultDocument(),
      editor: createDefaultEditorState(),
      slashMenu: createDefaultSlashMenuState(),
      emojiPicker: createDefaultEmojiPickerState(),
      floatingToolbar: createDefaultFloatingToolbarState(),
      focusMode: createDefaultFocusModeState(),
      saveState: createDefaultSaveState(),
      history: createDefaultHistoryState(),
      wordDensityPanelOpen: false,

      initializeDocument: (doc) => {
        set((state) => {
          state.document = doc ?? createDefaultDocument();
          state.history = createDefaultHistoryState();
        });
      },

      updateDocumentTitle: (title) => {
        set((state) => {
          state.document.title = title;
          state.document.updatedAt = createTimestamp();
        });
      },

      addBlock: (blockType, afterBlockId) => {
        let newBlock: Block;

        switch (blockType) {
          case "paragraph":
            newBlock = createParagraphBlock();
            break;
          case "heading":
            newBlock = createHeadingBlock("", 2);
            break;
          case "code":
            newBlock = createCodeBlock();
            break;
          case "table":
            newBlock = createTableBlock();
            break;
          case "callout":
            newBlock = createCalloutBlock("info");
            break;
          case "divider":
            newBlock = createDividerBlock();
            break;
          case "quote":
            newBlock = createQuoteBlock("");
            break;
          case "list":
            newBlock = createListBlock("bullet");
            break;
          default:
            newBlock = createParagraphBlock();
        }

        set((state) => {
          const index = afterBlockId
            ? state.document.blocks.findIndex((b) => b.id === afterBlockId) + 1
            : state.document.blocks.length;

          state.document.blocks.splice(index, 0, newBlock);
          state.document.updatedAt = createTimestamp();
          state.document.version += 1;
          state.editor.focusedBlockId = newBlock.id;
        });

        return newBlock.id;
      },

      updateBlock: (blockId, data) => {
        set((state) => {
          const block = state.document.blocks.find((b) => b.id === blockId);
          if (block) {
            Object.assign(block.data, data);
            block.updatedAt = createTimestamp();
            state.document.updatedAt = createTimestamp();
          }
        });
      },

      deleteBlock: (blockId) => {
        set((state) => {
          const index = state.document.blocks.findIndex(
            (b) => b.id === blockId
          );
          if (index !== -1 && state.document.blocks.length > 1) {
            state.document.blocks.splice(index, 1);
            state.document.updatedAt = createTimestamp();
            state.document.version += 1;

            if (state.editor.focusedBlockId === blockId) {
              const newFocusIndex = Math.max(0, index - 1);
              state.editor.focusedBlockId =
                state.document.blocks[newFocusIndex]?.id ?? null;
            }
          }
        });
      },

      moveBlock: (blockId, targetIndex) => {
        set((state) => {
          const currentIndex = state.document.blocks.findIndex(
            (b) => b.id === blockId
          );
          if (currentIndex !== -1 && currentIndex !== targetIndex) {
            const [block] = state.document.blocks.splice(currentIndex, 1);
            if (block) {
              state.document.blocks.splice(targetIndex, 0, block);
              state.document.updatedAt = createTimestamp();
            }
          }
        });
      },

      duplicateBlock: (blockId) => {
        set((state) => {
          const index = state.document.blocks.findIndex(
            (b) => b.id === blockId
          );
          const block = state.document.blocks[index];
          if (block) {
            const clonedBlock: Block = {
              ...JSON.parse(JSON.stringify(block)),
              id: crypto.randomUUID(),
              createdAt: createTimestamp(),
              updatedAt: createTimestamp(),
            };
            state.document.blocks.splice(index + 1, 0, clonedBlock);
            state.document.updatedAt = createTimestamp();
            state.document.version += 1;
          }
        });
      },

      setFocusedBlock: (blockId) => {
        set((state) => {
          state.editor.focusedBlockId = blockId;
          if (state.focusMode.isActive) {
            state.focusMode.focusedBlockId = blockId;
          }
        });
      },

      setSelection: (selection) => {
        set((state) => {
          state.editor.selection = selection;
        });
      },

      setCursor: (cursor) => {
        set((state) => {
          state.editor.cursor = cursor;
        });
      },

      openSlashMenu: (position, blockId) => {
        set((state) => {
          state.slashMenu.isOpen = true;
          state.slashMenu.position = position;
          state.slashMenu.triggerBlockId = blockId;
          state.slashMenu.query = "";
          state.slashMenu.selectedIndex = 0;
        });
      },

      closeSlashMenu: () => {
        set((state) => {
          state.slashMenu.isOpen = false;
          state.slashMenu.query = "";
          state.slashMenu.selectedIndex = 0;
          state.slashMenu.triggerBlockId = null;
        });
      },

      updateSlashMenuQuery: (query) => {
        set((state) => {
          state.slashMenu.query = query;
          state.slashMenu.selectedIndex = 0;
        });
      },

      setSlashMenuSelectedIndex: (index) => {
        set((state) => {
          state.slashMenu.selectedIndex = index;
        });
      },

      openEmojiPicker: (position, blockId) => {
        set((state) => {
          state.emojiPicker.isOpen = true;
          state.emojiPicker.position = position;
          state.emojiPicker.triggerBlockId = blockId;
          state.emojiPicker.query = "";
        });
      },

      closeEmojiPicker: () => {
        set((state) => {
          state.emojiPicker.isOpen = false;
          state.emojiPicker.query = "";
          state.emojiPicker.triggerBlockId = null;
        });
      },

      updateEmojiPickerQuery: (query) => {
        set((state) => {
          state.emojiPicker.query = query;
        });
      },

      showFloatingToolbar: (position) => {
        set((state) => {
          state.floatingToolbar.isVisible = true;
          state.floatingToolbar.position = position;
        });
      },

      hideFloatingToolbar: () => {
        set((state) => {
          state.floatingToolbar.isVisible = false;
        });
      },

      toggleFocusMode: () => {
        set((state) => {
          state.focusMode.isActive = !state.focusMode.isActive;
          if (state.focusMode.isActive) {
            state.focusMode.focusedBlockId = state.editor.focusedBlockId;
          } else {
            state.focusMode.focusedBlockId = null;
          }
        });
      },

      setFocusModeBlock: (blockId) => {
        set((state) => {
          state.focusMode.focusedBlockId = blockId;
        });
      },

      toggleWordDensityPanel: () => {
        set((state) => {
          state.wordDensityPanelOpen = !state.wordDensityPanelOpen;
        });
      },

      setSaveState: (status) => {
        set((state) => {
          state.saveState.status = status;
          if (status === "saved") {
            state.saveState.lastSavedAt = createTimestamp();
          }
        });
      },

      pushToHistory: (description) => {
        const { document } = get();
        const snapshot: HistoryEntry = {
          documentSnapshot: JSON.stringify(document),
          timestamp: createTimestamp(),
          description,
        };

        set((state) => {
          state.history.past.push(snapshot);
          if (state.history.past.length > MAX_HISTORY_SIZE) {
            state.history.past.shift();
          }
          state.history.future = [];
        });
      },

      undo: () => {
        const { history, document } = get();
        if (history.past.length === 0) return;

        const previousState = history.past[history.past.length - 1];
        if (!previousState) return;

        set((state) => {
          const currentSnapshot: HistoryEntry = {
            documentSnapshot: JSON.stringify(document),
            timestamp: createTimestamp(),
            description: "Current state",
          };

          state.history.future.unshift(currentSnapshot);
          state.history.past.pop();
          state.document = JSON.parse(previousState.documentSnapshot);
        });
      },

      redo: () => {
        const { history, document } = get();
        if (history.future.length === 0) return;

        const nextState = history.future[0];
        if (!nextState) return;

        set((state) => {
          const currentSnapshot: HistoryEntry = {
            documentSnapshot: JSON.stringify(document),
            timestamp: createTimestamp(),
            description: "Current state",
          };

          state.history.past.push(currentSnapshot);
          state.history.future.shift();
          state.document = JSON.parse(nextState.documentSnapshot);
        });
      },

      canUndo: () => get().history.past.length > 0,
      canRedo: () => get().history.future.length > 0,

      getBlockById: (blockId) =>
        get().document.blocks.find((b) => b.id === blockId),

      getBlockIndex: (blockId) =>
        get().document.blocks.findIndex((b) => b.id === blockId),
    })),
    {
      name: "textor-document",
      partialize: (state) => ({
        document: state.document,
      }),
    }
  )
);
