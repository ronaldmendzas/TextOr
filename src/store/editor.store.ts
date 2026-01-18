import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Document, EditorBlock } from '@/types/editor';

interface EditorState {
  document: Document | null;
  history: Document[];
  historyIndex: number;
  isSaving: boolean;
  lastSaved: Date | null;
  focusMode: boolean;
  
  setDocument: (document: Document) => void;
  updateContent: (content: EditorBlock[]) => void;
  undo: () => void;
  redo: () => void;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  toggleFocusMode: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    document: null,
    history: [],
    historyIndex: -1,
    isSaving: false,
    lastSaved: null,
    focusMode: false,

    setDocument: (document: Document) => {
      set(state => {
        state.document = document;
        state.history = [document];
        state.historyIndex = 0;
      });
    },

    updateContent: (content: EditorBlock[]) => {
      set(state => {
        if (!state.document) return;

        const updatedDocument = {
          ...state.document,
          content,
          updatedAt: new Date(),
          version: state.document.version + 1,
        };

        state.document = updatedDocument;
        
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(updatedDocument);
        
        state.history = newHistory.slice(-50);
        state.historyIndex = state.history.length - 1;
      });
    },

    undo: () => {
      const state = get();
      if (state.canUndo()) {
        set(draft => {
          draft.historyIndex--;
          draft.document = draft.history[draft.historyIndex];
        });
      }
    },

    redo: () => {
      const state = get();
      if (state.canRedo()) {
        set(draft => {
          draft.historyIndex++;
          draft.document = draft.history[draft.historyIndex];
        });
      }
    },

    setSaving: (saving: boolean) => {
      set({ isSaving: saving });
    },

    setLastSaved: (date: Date) => {
      set({ lastSaved: date });
    },

    toggleFocusMode: () => {
      set(state => {
        state.focusMode = !state.focusMode;
      });
    },

    canUndo: () => {
      const state = get();
      return state.historyIndex > 0;
    },

    canRedo: () => {
      const state = get();
      return state.historyIndex < state.history.length - 1;
    },
  }))
);
